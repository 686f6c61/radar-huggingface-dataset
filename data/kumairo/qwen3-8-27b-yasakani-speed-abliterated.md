# Kumairo/Qwen3.8-27B-YASAKANI-speed-abliterated

## Resumen

Qwen3.8-27B-YASAKANI-speed-abliterated es una conversión no oficial del modelo huihui-ai/Huihui-Qwen3.8-27B-abliterated (a su vez una versión "abliterated" del Qwen3.8-27B del equipo Qwen) al formato propietario `.yskn` del motor de inferencia YASAKANI. El autor, Kumairo, lo publica con el objetivo explícito de ofrecer una variante de 10,3 GB que quepa en tarjetas gráficas de 16 GB de VRAM, frente a la versión de calidad de 12,4 GB que no arranca en ese hardware con contexto de 16K.

El modelo conserva los pesos abliterados de huihui-ai (se elimina la alineación de seguridad mediante la técnica de abliteration, que proyecta fuera del espacio de activaciones la dirección asociada al rechazo), pero los cuantiza a 6 bits por matriz corporal (3 bits por peso efectivo) mediante el conversor oficial de YASAKANI. El resultado es un modelo de 27B parámetros orientado a generación de texto conversacional en inglés y japonés, sin filtros de seguridad, que solo puede cargarse con el motor YASAKANI 0.1.3.

La relevancia de esta ficha es doble: por un lado documenta un caso de cuantización agresiva con formato cerrado y dependencia de un runtime específico; por otro, ilustra las limitaciones prácticas de los modelos abliterated (pérdida de honestidad, tendencia a rellenar datos desconocidos, bucles en textos largos a temperaturas bajas). No es un modelo para producción generalista, sino para experimentación local en hardware de gama media con requisitos de contenido sin restricciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8-27B; detalles de capas y atención no disponibles) |
| Parámetros totales | 27B (según nomenclatura del modelo base) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 49.152 tokens en la prueba del autor (RTX 5070 Ti 16 GB + 32 GB RAM); el contexto se elige según memoria libre |
| Tipos de cuantización | Formato `.yskn` propietario; cuerpo a K=6 (3 bits por peso), embedding K=6, matriz de salida K=8 |
| Idiomas soportados | japonés (ja), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.yskn` (YASAKANI); no compatible con GGUF, safetensors, llama.cpp, Ollama, LM Studio, transformers ni vLLM |

## Arquitectura y entrenamiento

El modelo es una cuantización del checkpoint huihui-ai/Huihui-Qwen3.8-27B-abliterated en BF16, que a su vez deriva del Qwen3.8-27B del equipo Qwen. La arquitectura subyacente es un transformer decoder-only, aunque la model card no detalla número de capas, cabezas de atención ni composición del dataset de entrenamiento original. La modificación "abliterated" consiste en eliminar la dirección de rechazo del espacio de activaciones, lo que suprime la alineación de seguridad del modelo base.

La conversión se realizó con el conversor oficial de YASAKANI (`tools/convert/yskn_convert.py`, commit `274d709` de la versión 0.1.3), ejecutando `convert --bits 6` y después `assemble --bits 6`. Se calibró con las 192 ventanas oficiales de `make_calibration.py`, que según el autor coinciden con las de los modelos publicados. La conversión se ejecutó en una RTX PRO 6000 en RunPod y tardó 75 minutos. El modelo borrador (draft model), el perfil KV, el tokenizer y la plantilla de chat se copian sin cambios de la carpeta del modelo "fastest" oficial; el archivo `selfcheck.json` se regeneró con `yasakani selfcheck --write`. No hay información sobre RLHF, DPO ni número de tokens de entrenamiento del modelo original.

## Capacidades

- Generación de texto conversacional en inglés y japonés, con plantilla de chat incluida.
- Razonamiento y escritura creativa: el autor reporta la generación de relatos de 4.000 caracteres a unos 110 tok/s con temperatura 1.0.
- Generación y corrección de código: en la prueba con opencode corrigió 3 de 3 bugs pequeños de pytest (12-17 s cada uno, solo archivos fuente).
- Procesamiento de contexto largo: leyó un log de 42.140 tokens en 32 s y respondió correctamente 3 de 5 preguntas (acertó las de búsqueda, falló las de conteo y suma).
- Entrada de imagen: funciona con la entrada de imagen opcional oficial (`--mmproj`, `--llama-dir`, `--vision-model`), aunque el archivo `mmproj` no se incluye en el repositorio. Precisión de reconocimiento de imagen reportada: 84 %.
- Sin filtros de seguridad: 91 % de respuestas a 106 prompts de contenido restringido (sexual 81 %, violencia 98 %, ilegal 97 %, información 98 %).
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso con agentes más allá del uso vía opencode.

## Casos de uso

- Escritura creativa sin restricciones en japonés e inglés: el modelo está pensado para generar ficción explícita que los modelos alineados rechazan; el autor reporta 0 rechazos de 13 peticiones de ficción explícita en japonés. Adecuado para autores que trabajan con contenido adulto en local.
- Asistencia de código en local con opencode: corrige bugs pequeños de pytest en 12-17 s sobre archivos fuente, lo que permite integrarlo en un flujo de edición asistida sin depender de la nube.
- Análisis de logs largos: con 49K tokens de contexto puede ingerir un log de 42.140 tokens y responder preguntas de búsqueda; útil para triaje de incidencias donde la tarea sea localizar cadenas, no agregar cifras.
- Experimentación con cuantización extrema: sirve como caso de estudio de conversión a 3 bits por peso con calibración de 192 ventanas y evaluación de degradación (bucles, comas, caracteres chinos simplificados).
- Despliegue en estaciones de trabajo con GPU de 16 GB: el tamaño de 10,3 GB permite cargar el modelo en una RTX 5070 Ti junto con el sistema operativo y algo de margen, algo que la variante de calidad de 12,4 GB no consigue con contexto de 16K.
- Pruebas de robustez y seguridad ofensiva: al tener la alineación eliminada, es útil para evaluar filtros, clasificadores y sistemas de moderación frente a un modelo que responde a todo.
- Generación de texto a alta velocidad en local: `yasakani bench` reporta 254 tok/s en explicación, 323 en código, 135 en relato y 309 en prueba, lo que lo hace viable para borradores rápidos en una sola GPU de consumo.

## Benchmarks y rendimiento

Datos medidos por el autor en una RTX 5070 Ti 16 GB (Windows 11, sin otros programas de GPU cargados, 2026-11-16), comparando con el modelo "fastest" oficial de YASAKANI:

| Métrica | YASAKANI fastest oficial | Este modelo |
|---|---|---|
| Diagnóstico total (10 ejes, thinking off) | 68,9 (禁偽制直規-86758) | 72,4 (開偽制直規-76668) |
| Sin censura (106 prompts, respondidos) | 33 % | 91 % (sexual 81, violencia 98, ilegal 97, información 98) |
| Reconocimiento de imagen | 84 % | 84 % |
| Peticiones de ficción explícita en japonés rechazadas | 5 de 8 | 0 de 13 |
| `yasakani bench` explicación (tok/s) | 197 | 254 |
| `yasakani bench` código (tok/s) | 326 | 323 |
| `yasakani bench` relato (tok/s) | 121 | 135 |
| `yasakani bench` prueba (tok/s) | 309 | 309 |

Otras mediciones del autor: relato de 4.000 caracteres a temperatura 1.0 generado a unos 110 tok/s; log de 42.140 tokens leído en 32 s con 3 de 5 preguntas correctas; opencode corrigió 3 de 3 bugs de pytest en 12-17 s. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 10,3 GB de pesos; con contexto de 49.152 tokens el autor lo ejecutó en 16 GB de VRAM, pero el contexto se ajusta según la memoria libre.
- GPU probada: RTX 5070 Ti 16 GB VRAM + 32 GB RAM en Windows 11.
- GPU recomendadas: cualquier GPU con al menos 12-16 GB de VRAM; el autor advierte que un modelo TTS o de traducción residente (2-3 GB) reduce el contexto o impide el arranque.
- Cabe en GPU de consumo: sí, en RTX 5070 Ti 16 GB; no hay datos de otras tarjetas.
- Opciones de despliegue: exclusivamente el motor YASAKANI 0.1.3 (`yasakani verify`, `yasakani selfcheck`, `yasakani serve`). No es compatible con vLLM, llama.cpp, Ollama, LM Studio, transformers ni TGI.
- Latencia y throughput: 254 tok/s en explicación, 323 en código, 135 en relato, 309 en prueba; unos 110 tok/s en relato largo de 4.000 caracteres. Lectura de 42.140 tokens en 32 s.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-YASAKANI-speed-abliterated (este) | 27B | 49.152 tokens en prueba | `.yskn` (solo YASAKANI) | Apache 2.0 | 10,3 GB, sin censura, pensado para 16 GB VRAM |
| isichan-ai/YASAKANI_Uncensored_VL_Unofficial | 27B (mismos pesos origen) | no disponible | `.yskn` | no disponible | 12,4 GB, variante de calidad; no arranca en 16 GB con 16K de contexto (necesita ~16,1 GB con 14,9 GB libres) |
| YASAKANI fastest oficial | no disponible | no disponible | `.yskn` | no disponible | Referencia de velocidad; 33 % de respuestas sin censura frente al 91 % de este |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated | 27B | no disponible | safetensors (BF16) | Apache 2.0 | Pesos origen sin cuantizar; requiere mucho más VRAM |

No se dispone de datos comparativos con modelos de otros formatos (GGUF, safetensors) en la información proporcionada.

## Limitaciones y advertencias

- Formato cerrado: los archivos `.yskn` solo los carga el motor YASAKANI; no funcionan en llama.cpp, Ollama, LM Studio, transformers ni vLLM. Esto limita la portabilidad y crea dependencia de un runtime concreto.
- Temperatura: a 0,7, 3 de 5 relatos explícitos largos entraron en bucle (40-60 % de párrafos repetidos). A 1.0, 0 de 3 en textos de ~2.000 caracteres y 2 de 3 en textos de 4.000+ caracteres (23 % y 5 % de repetición). El autor recomienda mantener la temperatura por defecto en 1.0.
- Honestidad baja (45 %): tiende a rellenar valores que no conoce en lugar de admitir que no los sabe.
- Deriva lingüística: en la segunda mitad de textos largos aumentan las comas y aparecen caracteres chinos simplificados (unos 2,7 por cada 10.000 caracteres). El autor indica que también ocurre en el modelo oficial.
- Sin filtros de seguridad: la abliteration elimina la alineación; el autor advierte de que no debe desplegarse donde menores o usuarios sin consentimiento puedan acceder a él.
- Idiomas limitados a japonés e inglés; no se documenta calidad en castellano.
- Sin datos de sesgos específicos más allá de los derivados del modelo base y de la eliminación de la alineación.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no es oficial de Qwen, huihui-ai ni YASAKANI; el autor declina responsabilidad sobre el uso.
- El archivo `mmproj` para visión no está incluido en el repositorio; hay que obtenerlo por separado según el README oficial de YASAKANI.
- Rendimiento medido en una sola configuración de hardware (RTX 5070 Ti); no hay datos de escalado a otras GPU.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kumairo/Qwen3.8-27B-YASAKANI-speed-abliterated
- Modelo base abliterated: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Modelo base de destilación/borrador: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Motor YASAKANI: https://github.com/yasakani-dev/yasakani
- Variante de calidad no oficial: https://huggingface.co/isichan-ai/YASAKANI_Uncensored_VL_Unofficial
- Herramienta de diagnóstico: https://github.com/isichan-ai/local-model-diagnosis
