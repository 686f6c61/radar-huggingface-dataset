# ar2a/daad-arabic-gec-litertlm

## Resumen

Daad Arabic GEC LiteRT-LM es una distribucion en formato LiteRT-LM del modelo `alnnahwi/gemma-3-1b-arabic-gec-v1`, un ajuste fino de Gemma 3 1B de Google especializado en correccion gramatical de arabe (Grammatical Error Correction, GEC). El ajuste original lo desarrollo Bahjat Al Mostafa (Alnnahwi), y esta conversion la publica el usuario `ar2a` para alimentar la aplicacion de correccion ortografica y gramatical arabe ضاد (Daad) en Android y Chrome, ejecutandose integramente en el dispositivo.

El modelo resuelve un problema muy concreto: recibir una frase en arabe y devolver la version corregida, sin depender de la nube. Gracias a su tamano (1B parametros) y a la cuantizacion, las builds ocupan 1,03 GB (8 bits) y 592 MB (4 bits), lo que permite inferencia local en moviles y en el navegador via WebGPU.

Es relevante porque demuestra el pipeline completo de despliegue on-device de un modelo de lenguaje pequeno especializado: ajuste fino sobre Gemma 3 1B, conversion a `.litertlm` con `litert-torch` y cuantizacion de pesos con activaciones en fp32. No es un modelo generalista, sino una herramienta de una sola tarea optimizada para latencia y privacidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3 1B), exportado a LiteRT-LM |
| Parametros totales | 1B (heredados del modelo base Gemma 3 1B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | cache de 1024 tokens en la exportacion (`--cache_length=1024`) |
| Tipos de cuantizacion | 8 bits (dynamic_wi8_afp32) y 4 bits con block size 32 (dynamic_wi4b32_afp32); activaciones en fp32 |
| Idiomas soportados | arabe (ar), principalmente arabe estandar moderno |
| Licencia | Gemma Terms of Use |
| Formato de pesos | `.litertlm` (LiteRT-LM); el modelo original esta en safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 3 1B, un transformer decoder-only denso de Google. Sobre esa base, el autor original realizo un ajuste fino supervisado para la tarea de correccion gramatical en arabe. La model card no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; esos datos no estan disponibles en la informacion proporcionada.

La innovacion de esta publicacion no esta en el entrenamiento, sino en el empaquetado: los pesos se convierten de safetensors a LiteRT-LM con `litert-torch export_hf`, usando `--cache_length=1024`, `--prefill_lengths=256` y `--externalize_embedder=True`. Los pesos se cuantizan a 8 o 4 bits manteniendo las activaciones en fp32, sin reentrenamiento posterior. La build web requiere activaciones fp32 para funcionar sobre WebGPU.

## Capacidades

- Correccion gramatical de frases en arabe: recibe una oracion y devuelve la version corregida.
- Generacion de texto en formato de chat de Gemma (segun la model card del modelo original).
- Inferencia on-device en Android mediante LiteRT-LM.
- Inferencia en navegador mediante `@litert-lm/core` sobre WebGPU.
- Funcionamiento completamente offline, sin llamadas a servicios externos.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Corrector ortografico y gramatical integrado en teclados Android: la build de 4 bits (592 MB) cabe en el almacenamiento de un movil y permite sugerir correcciones mientras el usuario escribe, sin enviar texto a un servidor.
- Extension de navegador para revision de textos en arabe: la build web con WebGPU permite validar redacciones, correos o formularios directamente en el navegador, preservando la privacidad del contenido.
- Revision de documentos antes de publicacion: articulos, notas de prensa o comunicados en arabe estandar moderno pueden pasarse por el modelo para detectar errores gramaticales antes de su difusion.
- Herramienta educativa para estudiantes de arabe: el modelo puede mostrar la forma corregida de una frase y servir de apoyo en ejercicios de escritura, siempre con revision humana.
- Preprocesado de datos en pipelines de NLP arabe: normalizar y corregir corpus de texto recogido de fuentes ruidosas antes de usarlo en otros sistemas.
- Asistencia a correctores profesionales: como primera pasada automatica que reduce el trabajo manual en la revision de textos largos, con validacion posterior por parte del revisor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: la build de 8 bits ocupa 1,03 GB en disco; la de 4 bits, 592 MB. El consumo en ejecucion depende del runtime LiteRT-LM y de la longitud de contexto usada (hasta 1024 tokens de cache).
- Despliegue en moviles Android de gama media y alta mediante LiteRT-LM.
- Despliegue en navegador con WebGPU; la build web necesita activaciones fp32.
- No se especifican GPU de escritorio recomendadas (A100, H100, RTX 4090) porque el objetivo del formato es la inferencia en dispositivo.
- Opciones de despliegue: LiteRT-LM (Android) y `@litert-lm/core` (WebGPU en navegador). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que el formato `.litertlm` no es compatible con esos runtimes.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Daad Arabic GEC LiteRT-LM | 1B | 1024 tokens (cache de exportacion) | `.litertlm` | Gemma Terms of Use | Correccion gramatical arabe on-device |
| alnnahwi/gemma-3-1b-arabic-gec-v1 | 1B | no disponible | safetensors | Gemma Terms of Use | Correccion gramatical arabe (modelo original) |
| Google Gemma 3 1B | 1B | no disponible | safetensors, GGUF, otros | Gemma Terms of Use | Modelo generalista multilingue |

La comparativa con otros correctores gramaticales arabes especificos no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado para arabe estandar moderno; puede no manejar bien los dialectos arabes.
- Las correcciones pueden ser erroneas; la model card recomienda revisar cada sugerencia antes de aceptarla.
- La cuantizacion altera ligeramente la salida respecto al modelo original, y mas en la build de 4 bits que en la de 8 bits.
- La ventana de contexto efectiva esta limitada a 1024 tokens por la configuracion de exportacion.
- Uso sujeto a los Gemma Terms of Use y a la Gemma Prohibited Use Policy; es necesario revisar ambas antes de un uso comercial.
- No se documentan sesgos especificos, pero al derivar de un modelo generalista de Google puede heredar sesgos del corpus de entrenamiento original.
- El formato `.litertlm` restringe el despliegue a LiteRT-LM y `@litert-lm/core`; no es portable a otros runtimes sin reconversion.
- Riesgo de alucinacion en el sentido de producir correcciones plausibles pero incorrectas, especialmente en frases ambiguas o con errores multiples.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ar2a/daad-arabic-gec-litertlm
- Modelo original: https://huggingface.co/alnnahwi/gemma-3-1b-arabic-gec-v1
- Web del autor original (Alnnahwi): https://alnnahwi.com/
- LiteRT-LM (repositorio): https://github.com/google-ai-edge/LiteRT-LM
- Gemma 3 (Google): https://ai.google.dev/gemma
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
