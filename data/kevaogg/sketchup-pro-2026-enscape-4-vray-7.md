# KevaoGG/sketchup-pro-2026-enscape-4-vray-7

## Resumen

No existe un modelo de IA open source en el repositorio `KevaoGG/sketchup-pro-2026-enscape-4-vray-7`. El artefacto publicado bajo ese identificador en Hugging Face es un paquete ZIP para Windows (`sketchup-pro-2026-enscape-4-vray-7-v1.2.0-win64.zip`, 8,9 MB) que se presenta como instalador de SketchUp Pro 2026 junto con los complementos Enscape 4 y V-Ray 7. No contiene pesos, tokenizador, configuración de arquitectura ni ningún otro componente propio de un modelo de lenguaje o de visión.

La model card no describe ninguna arquitectura neuronal, conjunto de datos de entrenamiento ni proceso de ajuste. En su lugar, enumera supuestas capacidades del ejecutable (aceleración por GPU, "desbloqueo de estación de trabajo", activación sin conexión) e instrucciones para descargar y ejecutar un binario protegido con contraseña. El repositorio tiene 0 descargas y 0 likes, y su fecha de creación (2026-11-23) es posterior a la fecha actual, lo que apunta a un artefacto generado de forma automatizada.

Por tanto, esta ficha no puede documentar especificaciones técnicas, arquitectura, capacidades ni benchmarks de un modelo, porque no los hay. Los apartados siguientes reflejan esa ausencia de forma explícita y advierten sobre los riesgos de seguridad asociados al artefacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los tags de idioma del repo no corresponden a capacidades de un modelo) |
| Licencia | MIT (declarada para el paquete, no para un modelo) |
| Formato de pesos | no disponible (el artefacto es un ZIP con un `.exe` para Windows x64) |

## Arquitectura y entrenamiento

No hay arquitectura que describir. El repositorio no incluye `config.json`, ficheros `safetensors`, `GGUF` ni ningún artefacto de pesos. Tampoco hay información sobre tokens de entrenamiento, composición del dataset, RLHF, DPO ni innovaciones técnicas de inferencia (atención lineal, decodificación especulativa, etc.).

La "arquitectura" declarada en la model card se limita a un ejecutable de Windows con supuestas rutinas de aceleración por GPU (CUDA, TensorRT, DirectML, OpenCL) y módulos de activación local. Esa descripción no es verificable y no corresponde a un modelo entrenado.

## Capacidades

- No se documenta ninguna capacidad de generación de texto, razonamiento, código, matemáticas, visión o audio.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe real; los idiomas listados son etiquetas del repositorio, no del modelo.
- No se documenta ningún modo especial (thinking mode, visión, audio).

## Casos de uso

No procede. Al no existir un modelo de IA, no hay escenarios de inferencia, generación, RAG, agentes ni despliegue en producción que puedan apoyarse en este artefacto. Cualquier uso del paquete ZIP publicado queda fuera del ámbito de esta ficha y se trata en el apartado de limitaciones y advertencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay modelo).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no aplica.

El paquete declara compatibilidad con Windows 10 (22H2) y Windows 11 (24H2) en x64, pero esa compatibilidad se refiere al ejecutable, no a un modelo.

## Comparativa con modelos similares

No disponible. No existe una categoría de modelos comparable porque el artefacto no es un modelo de IA. Compararlo con LLM o modelos multimodales sería incorrecto.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA: no hay pesos, tokenizador ni configuración que puedan cargarse con `transformers`, `vLLM`, `llama.cpp` u otras herramientas.
- El artefacto es un ZIP con contraseña que contiene un ejecutable de Windows (`sketchup-pro-2026-enscape-4-vray-7-v1.2.0-win64.exe`). Ejecutar binarios de origen no verificado como administrador supone un riesgo elevado de malware, robo de credenciales o persistencia en el sistema.
- La model card incluye instrucciones para desactivar alertas de Windows Defender y SmartScreen, lo que es una señal de alarma clásica en distribuciones no legítimas.
- El uso de nombres de productos comerciales (SketchUp Pro, Enscape, V-Ray) sin autorización de sus titulares puede constituir infracción de marca y de derechos de autor; la licencia MIT declarada no cubre el software de terceros empaquetado.
- La fecha de creación del repositorio (2026-11-23) es posterior a la actual, lo que sugiere generación automatizada o manipulación de metadatos.
- Cero descargas y cero likes: no hay evidencia de uso ni de validación por parte de la comunidad.
- No debe utilizarse en producción, ni en entornos corporativos, ni en máquinas con datos sensibles.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/KevaoGG/sketchup-pro-2026-enscape-4-vray-7
- Repositorio de GitHub referenciado en la model card: https://github.com/Katherinel99185/sketchup-pro-2026-enscape-4-vray-7
- Descarga directa citada en la model card (no recomendada): https://github.com/Katherinel99185/sketchup-pro-2026-enscape-4-vray-7/releases/latest/download/sketchup-pro-2026-enscape-4-vray-7-v1.2.0-win64.zip
- Página de releases citada: https://github.com/Katherinel99185/sketchup-pro-2026-enscape-4-vray-7/releases/latest
