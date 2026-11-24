# nevernotnic/liars-bar-cheat-card-esp-keyless

## Resumen

El artefacto publicado como `nevernotnic/liars-bar-cheat-card-esp-keyless` no es un modelo de inteligencia artificial. Se trata de un repositorio alojado en Hugging Face que distribuye un ejecutable para Windows (`inzoi-cheat-trainer-mod-menu-v1.2.2-win64.exe`) empaquetado en un archivo ZIP de 4,8 MB, presentado por su autor como una herramienta de tipo "cheat" o "trainer" para el videojuego Liars Bar, con supuestas funciones de ESP (extra-sensory perception, visualización de elementos del juego), radar 2D y filtrado de objetos.

El repositorio no contiene pesos de modelo, tokenizador, configuración de arquitectura ni ningún artefacto relacionado con aprendizaje automático. Los metadatos de Hugging Face no declaran pipeline, y las etiquetas (`windows`, `windows-11`, `x64`, `portable`) describen un binario de escritorio, no un modelo entrenado. La licencia declarada es MIT, pero se aplica al paquete distribuido, no a un modelo.

Desde la perspectiva de evaluación de modelos, esta ficha no puede cumplimentarse con datos técnicos reales porque no existen. Los apartados siguientes reflejan esa ausencia de forma explícita y señalan los riesgos de seguridad asociados a la distribución de ejecutables a través de plataformas de modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable de Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto es un ZIP con un `.exe`; no hay safetensors ni GGUF) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento asociado a este repositorio. El contenido descrito en la model card es un binario portable para Windows 10/11 de 64 bits, con un tamaño declarado de 4,8 MB, protegido por contraseña de descompresión (`2026`) y distribuido mediante enlaces a repositorios de GitHub de terceros. Las supuestas capacidades técnicas mencionadas (overlay a 144 Hz, radar 2D, suavizado de entrada Bézier, "panic key" con la tecla `END`) corresponden a funcionalidades de un programa de trampas para videojuegos, no a componentes de un modelo lingüístico.

No se han publicado datos sobre tokens de entrenamiento, composición del dataset, técnicas de alineación (RLHF, DPO) ni innovaciones de inferencia. Cualquier intento de encajar este artefacto en la categoría de "modelo open source" sería incorrecto.

## Capacidades

- No genera texto, código, matemáticas ni razonamiento: no es un modelo de lenguaje.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües en el sentido de un modelo; los idiomas listados son metadatos de la ficha, no capacidades de procesamiento.
- No dispone de modo "thinking", visión, audio ni ninguna modalidad de IA.
- El binario declara funciones de trampas para el juego Liars Bar (ESP, radar, filtrado de objetos), sin verificación independiente.

## Casos de uso

- No procede: el artefacto no es un modelo de IA y no tiene aplicaciones legítimas de procesamiento de lenguaje, visión o generación.
- Uso como objeto de estudio de seguridad: analizar en un entorno aislado cómo se distribuyen ejecutables potencialmente maliciosos a través de plataformas de modelos, para formar a equipos de seguridad.
- Auditoría de políticas de moderación de Hugging Face: documentar ejemplos de repositorios que no cumplen la finalidad de la plataforma.
- Investigación sobre ingeniería social: estudiar tácticas de presentación (badges falsos, contraseñas en la model card, enlaces a GitHub de terceros) usadas para inducir descargas.
- Formación en respuesta a incidentes: usar el caso como muestra en ejercicios de análisis de binarios sospechosos.
- Concienciación de desarrolladores: ilustrar por qué no debe ejecutarse código descargado de repositorios sin verificar procedencia y firma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación, porque el artefacto no es un modelo evaluable.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay inferencia de modelo).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Plataforma declarada: Windows 10/11 de 64 bits, con ejecución "como administrador" según la model card.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): ninguna; no es un modelo.
- Latencia y throughput: no disponibles; las cifras de "294 Hz de polling" y "144 Hz de overlay" son afirmaciones del autor sin verificación.

## Comparativa con modelos similares

| Criterio | Este repositorio | Modelo de IA típico (referencia genérica) |
|---|---|---|
| Naturaleza | Ejecutable de Windows (ZIP + `.exe`) | Pesos en safetensors/GGUF |
| Parámetros | no disponible | Variable (p. ej., 7B, 70B) |
| Contexto | no disponible | Miles a millones de tokens |
| Evaluación | ninguna | Benchmarks públicos |
| Licencia | MIT (sobre el binario) | MIT, Apache 2.0, etc. |
| Reproducibilidad | no verificable | Verificable con hash de pesos |

No se identifican modelos comparables porque la categoría no coincide.

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse como tal ni incluirse en comparativas de modelos.
- Riesgo de seguridad elevado: distribución de un `.exe` a través de Hugging Face con contraseña de descompresión y enlaces a repositorios de GitHub de terceros; patrón habitual en campañas de malware.
- Sin verificación de integridad: no se ofrecen hashes firmados ni procedencia verificable del binario.
- La ejecución "como administrador" amplía el impacto potencial de cualquier código malicioso.
- Posible incumplimiento de los términos de servicio del videojuego y de las políticas de la plataforma.
- La licencia MIT no exime de responsabilidad por daños derivados de la ejecución del binario.
- Cero descargas y cero "likes" en el momento de la consulta: sin validación por parte de la comunidad.
- No usar en producción ni en entornos con datos sensibles.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/nevernotnic/liars-bar-cheat-card-esp-keyless
- Repositorio de GitHub enlazado en la model card (descarga del ZIP): https://github.com/Roussel10024/inzoi-cheat-trainer-mod-menu/releases/download/v1.2.0/inzoi-cheat-trainer-mod-menu-v1.2.2-win64.zip
- Repositorio de GitHub secundario: https://github.com/GloriaMoretti876/liars-bar-cheat-card-esp-keyless/releases/latest
- No se han encontrado papers, blogs, demos ni documentación técnica adicional en la información disponible.
