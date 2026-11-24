# Marselox/arc-raiders-cheat-esp-pc

## Resumen

El repositorio `Marselox/arc-raiders-cheat-esp-pc` no contiene un modelo de inteligencia artificial, sino un supuesto paquete ejecutable de tipo *cheat* (trampas) para el videojuego Arc Raiders, distribuido como binario para Windows de 64 bits. La model card describe un programa externo en modo usuario con overlay, ESP (detección de jugadores a través de paredes), radar 2D, filtrado de botín y suavizado de entrada, empaquetado en un ZIP de 8,9 MB protegido con contraseña. No hay pesos, tokenizador, configuración de arquitectura ni artefactos de inferencia de ningún tipo.

Desde la perspectiva de un catálogo de modelos de IA open source, esta ficha no describe un modelo evaluable: no existen parámetros, contexto, cuantizaciones ni licencia de pesos que analizar. Lo relevante aquí es la advertencia: se trata de un binario de terceros que promete ventajas en un juego multijugador, acompañado de instrucciones para ejecutarlo como administrador y desactivar avisos de seguridad. Ese patrón es habitual en campañas de distribución de *malware* y en infracciones de los términos de servicio de plataformas de juego.

La ficha se mantiene por rigor documental: se registran los datos disponibles, se marcan como "no disponible" los campos técnicos inexistentes y se detallan los riesgos. No debe interpretarse como una recomendación de uso ni como una evaluación de capacidades de IA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; binario externo para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio) |
| Licencia | MIT (declarada en los metadatos del repositorio) |
| Formato de pesos | no disponible (se distribuye un ZIP con un `.exe`; no hay safetensors, GGUF ni similar) |

## Arquitectura y entrenamiento

No aplica. No existe arquitectura de red neuronal, corpus de entrenamiento, proceso de ajuste (RLHF, DPO, SFT) ni innovación técnica de inferencia que documentar. La model card describe componentes de un programa de trampas: núcleo externo en modo usuario sin *hooks* DLL, overlay por Desktop Duplication, escáner dinámico de offsets con resolución de firmas de punteros, suavizado de entrada Bézier, capa de render excluida de capturas (OBS, ShadowPlay, Discord) y radar 2D con filtro de botín a 295 Hz de sondeo.

Todos esos datos provienen exclusivamente de la model card del autor y no son verificables ni auditables desde el repositorio de Hugging Face. No hay código fuente, *commits*, artefactos de build ni trazabilidad que respalde las cifras declaradas (por ejemplo, los tiempos de respuesta de 35-41 ms o el consumo de 41 MB de RAM).

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve matemáticas.
- No soporta *tool calling* ni *function calling*.
- No implementa agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües reales; los códigos de idioma son metadatos del repositorio.
- El binario declara funciones de trampa en un juego: ESP con cajas 2D/3D, esqueletos de huesos, distancia, radar 2D, filtrado de botín por rareza y suavizado de puntería.
- No se ha verificado ninguna de esas funciones; la model card es la única fuente.

## Casos de uso

- Ninguno legítimo en el ámbito de IA, desarrollo de software o investigación.
- Auditoría de seguridad: analizar el binario en un entorno aislado para identificar comportamiento malicioso, técnicas de evasión de capturas o persistencia.
- Estudio de campañas de *malware*: documentar el patrón de distribución (ZIP con contraseña, ejecución como administrador, instrucciones para ignorar SmartScreen) como caso de ingeniería social.
- Formación en ciberseguridad: usar el ejemplo para enseñar por qué no se ejecutan binarios de origen desconocido con privilegios elevados.
- Investigación sobre trampas en videojuegos: analizar el ecosistema de *cheats* y su impacto en la integridad de juegos multijugador.
- Moderación de plataformas: ilustrar criterios para detectar y retirar repositorios que distribuyen binarios potencialmente dañinos bajo apariencia de proyecto open source.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No existen métricas de MMLU, HumanEval, GSM8K ni equivalentes porque no hay modelo. Las cifras de la model card (respuesta en menos de 37 ms, consistencia del 97,6 %, sondeo a 295 Hz) son afirmaciones del autor sin metodología ni verificación.

## Requisitos de hardware

- Plataforma objetivo declarada: Windows de 64 bits (Windows 11 incluido en las etiquetas).
- VRAM estimada: no aplica; no hay inferencia de red neuronal.
- GPU recomendadas: no aplica.
- Ejecución en GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles; las cifras de la model card no son verificables.
- Requisito real de ejecución: privilegios de administrador sobre el sistema, según las propias instrucciones del autor.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque el repositorio no contiene un modelo. Tampoco procede compararlo con otros *cheats*, ya que no se dispone de información verificable sobre ellos en el material proporcionado.

## Limitaciones y advertencias

- No es un modelo de IA: no debe catalogarse, evaluarse ni desplegarse como tal.
- Riesgo elevado de *malware*: binario de origen desconocido, sin código fuente, con contraseña en el propio README y con instrucciones explícitas para ejecutarlo como administrador y sortear SmartScreen y Windows Defender.
- La licencia MIT declarada en los metadatos no aporta garantías sobre el contenido del ejecutable ni sobre su seguridad.
- Uso prohibido por los términos de servicio de Arc Raiders y de la mayoría de plataformas de juego; puede conllevar el baneo de cuentas.
- Posible infracción de derechos de autor o de propiedad intelectual del desarrollador del juego.
- Sin trazabilidad: cero descargas y cero *likes* en el momento de la consulta, sin historial de *commits* ni artefactos auditables.
- Las capacidades declaradas (ESP, radar, evasión de capturas) no están verificadas y podrían ser señuelos para la instalación de software dañino.
- No debe ejecutarse en máquinas de producción, de trabajo ni con cuentas personales vinculadas a datos sensibles.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Marselox/arc-raiders-cheat-esp-pc
- Repositorio de GitHub citado en la model card: https://github.com/JakubHedlund06/arc-raiders-cheat-esp-pc
- Descarga del archivo ZIP citada en la model card: https://github.com/JakubHedlund06/arc-raiders-cheat-esp-pc/releases/latest/download/arc-raiders-cheat-esp-pc-v1.2.0-win64.zip
- Página de releases citada en la model card: https://github.com/JakubHedlund06/arc-raiders-cheat-esp-pc/releases/latest
