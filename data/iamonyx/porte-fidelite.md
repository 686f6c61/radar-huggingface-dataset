# iamonyx/porte-fidelite

## Resumen

`porte-fidelite` no es un modelo de lenguaje ni una red neuronal entrenada por el autor: es un repositorio de herramientas de control de calidad (un "gate" o puerta de validación) publicado por el usuario `iamonyx` bajo licencia MIT. Contiene dos instrumentos independientes que verifican la fidelidad de material generado respecto a una referencia canónica de un personaje virtual llamado Onyx, una peluche naranja ficticia. El primero, `qa-gate/`, evalúa imágenes mediante tres controles (paleta de color, proporciones y similitud perceptual); el segundo, `verificateur-voix/`, valida la frecuencia fundamental de grabaciones de voz.

El problema que resuelve es concreto: en flujos de generación de contenido asistida por IA (ComfyUI, LTX, Blender, según cita la propia model card), se producen decenas de imágenes o tomas de las que solo unas pocas respetan la identidad visual y sonora del personaje. En lugar de revisar manualmente todas, la puerta filtra automáticamente y deja pasar únicamente las candidatas que cumplen umbrales medibles, reduciendo la carga de revisión humana al último eslabón de la cadena.

Es relevante ahora como ejemplo de patrón de "QA determinista" aplicado a pipelines generativos: combina métricas reproducibles (ΔE CIEDE2000 en espacio Lab D65, ratios de proporciones, coseno de embeddings DINOv2-small vía ONNX en CPU) con veredictos legibles por máquina (códigos de salida 0/1/2 y reporte JSON). No hay pesos de modelo propios en el repositorio; el único componente de aprendizaje automático es DINOv2-small, que se descarga de terceros (`onnx-community/dinov2-small`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica: conjunto de scripts de validación (Python) con un pre-filtro de similitud basado en DINOv2-small (ONNX, CPU) |
| Parametros totales | No disponible (el repositorio no incluye pesos propios; DINOv2-small es un componente externo) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Frances (documentacion y mensajes del repositorio); el codigo no procesa lenguaje natural |
| Licencia | MIT (codigo); el personaje Onyx y su referencia canonica quedan fuera del repositorio y son propiedad del taller |
| Formato de pesos | No aplica; el pre-filtro usa un modelo ONNX de terceros (`onnx-community/dinov2-small`) |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo. `qa-gate/` implementa tres controles secuenciales sobre cada imagen: (1) comparación de colores dominantes contra la carta gráfica en ΔE CIEDE2000 (espacio Lab, iluminante D65), con veredicto PASS si el ΔE mediano es ≤ 6,5 y la cobertura conforme ≥ 85 %; (2) heurística de proporciones que compara la relación anchura de cabeza / altura de silueta con los encuadres canónicos (busto ≈ 0,70; cuerpo entero ≈ 0,47); y (3) pre-filtro de similitud por coseno con DINOv2-small ejecutado en ONNX sobre CPU, que la propia documentación califica explícitamente como pre-filtro, no como criterio final. Los veredictos por imagen son PASS / À SURVEILLER / REJET, con resumen en texto y reporte JSON completo, y códigos de salida diseñados para scripting: `0` si todo PASS, `1` si al menos un À SURVEILLER, `2` si al menos un REJET.

`verificateur-voix/` mide la frecuencia fundamental mediana de un archivo WAV y comprueba que se mantenga en la banda de referencia de la voz maestra (123–151 Hz, referencia 137 Hz); fuera de banda, la toma se descarta. La model card documenta además pruebas negativas de calibración: un desplazamiento de tono de +18° hace caer la cobertura al 7 %, lo que produce REJET. Deliberadamente no se incluyen en el repositorio la referencia canónica del personaje, el modelo ONNX de DINOv2 (se retélécharge desde `onnx-community/dinov2-small`) ni las imágenes de prueba; el usuario debe aportar su propia referencia con `--ref`.

## Capacidades

- Validación de imágenes contra una referencia canónica mediante métrica de color perceptual (ΔE CIEDE2000) con umbrales configurables.
- Comprobación heurística de proporciones de encuadre (busto y cuerpo entero).
- Pre-filtro de similitud visual mediante embeddings DINOv2-small en ONNX, ejecutable en CPU sin GPU.
- Emisión de veredictos por imagen (PASS / À SURVEILLER / REJET) en texto y en JSON estructurado.
- Códigos de salida para integración en scripts y pipelines de CI.
- Validación de voz por frecuencia fundamental mediana con banda de referencia definida.
- Funcionamiento completamente local y offline tras la instalación, sin servicios externos.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es una herramienta de verificación, no un modelo generativo.

## Casos de uso

- Filtrado previo a publicación de imágenes generadas: en un flujo ComfyUI o LTX que produce lotes de 50 imágenes, `qa-gate` descarta automáticamente las que no respetan la paleta o las proporciones, de modo que el revisor humano solo examina las que pasan.
- Control de consistencia de personaje en series de contenido: al fijar la referencia canónica con `--ref`, cualquier variación de tono o encuadre que se desvíe de la carta gráfica se marca como À SURVEILLER o REJET antes del montaje.
- Integración en CI/CD de un estudio de animación: los códigos de salida 0/1/2 permiten que un job de integración continua bloquee la publicación de assets que no cumplan los umbrales, sin intervención manual.
- Validación de tomas de voz en doblaje o animación: `verifier-voix.py` comprueba que cada grabación mantiene la banda 123–151 Hz de la voz maestra y descarta tomas de otra voz antes de llegar al montaje.
- Auditoría reproducible de assets: el reporte JSON con métricas por imagen (ΔE mediano, cobertura, ratios de proporciones, coseno) sirve como registro verificable de qué se aceptó y por qué.
- Prototipado de pipelines de QA para otros personajes: los umbrales y la estructura de tres controles son reutilizables como plantilla para cualquier proyecto con una carta gráfica y una referencia canónica propias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente documenta una prueba negativa de calibración: con un desplazamiento de tono de +18°, la cobertura conforme cae al 7 % y el veredicto resultante es REJET.

## Requisitos de hardware

- No requiere GPU: el pre-filtro DINOv2-small se ejecuta en ONNX sobre CPU y el resto de controles son cálculos deterministas (color, proporciones, FFT para la frecuencia fundamental).
- Entorno de ejecución: Python 3 con entorno virtual (`python3 -m venv .venv`) e instalación de dependencias vía `requirements.txt`.
- Almacenamiento: el modelo ONNX de DINOv2-small se descarga de terceros (`onnx-community/dinov2-small`); el tamaño exacto no está indicado en la información disponible.
- Despliegue: ejecución directa como script de línea de comandos (`qa_gate.py` y `verifier-voix.py`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de herramienta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Herramienta | Enfoque | Componente ML | Licencia | Ejecución local |
|---|---|---|---|---|
| porte-fidelite (este repositorio) | QA de fidelidad de personaje (imagen y voz) con umbrales deterministas | DINOv2-small como pre-filtro | MIT | Sí, offline |
| Similitud por embeddings (p. ej. CLIP/DINOv2 a secas) | Comparación de similitud visual genérica | Modelo de embeddings | Según modelo | Sí |
| Herramientas de QA perceptual de imagen (SSIM/LPIPS) | Métricas de diferencia perceptual entre imágenes | Ninguno o mínimo | Variable | Sí |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación es cualitativa y basada en el enfoque técnico descrito en la model card.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, imágenes ni audio; es un conjunto de scripts de validación. Cualquier expectativa de inferencia generativa es incorrecta.
- La referencia canónica del personaje no se incluye en el repositorio; sin aportar una referencia propia con `--ref`, la puerta de imagen no puede operar.
- El control de proporciones es explícitamente heurístico y el de similitud es solo un pre-filtro; la documentación reconoce que "la palette et les proportions font foi pour les écarts fins, et l'humain tranche au final".
- La validación de voz se limita a la frecuencia fundamental mediana; no evalúa timbre, prosodia ni inteligibilidad.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y una fecha de creación futura (2026-11-23), lo que impide verificar su madurez o uso real en producción.
- El personaje Onyx y su referencia canónica son propiedad del taller y no están cubiertos por la licencia MIT, que se aplica únicamente al código.
- La documentación está en francés; no se indica soporte de otros idiomas en mensajes o informes.
- No se documentan sesgos de modelo porque no hay modelo entrenado por el autor; el único componente de aprendizaje (DINOv2-small) es de terceros y sus sesgos no se analizan en la model card.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/iamonyx/porte-fidelite
- Modelo ONNX de terceros para el pre-filtro: https://huggingface.co/onnx-community/dinov2-small
- Referencia a herramientas de generación citadas en la model card: ComfyUI, LTX, Blender (sin enlaces directos proporcionados)
- Repositorio de gabaritos 3D citado: `gabarits-porte-3d` (sin URL proporcionada)
