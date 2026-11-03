# sartajbhuvaji/unfuse-Qwen3.8-27B-mmproj-GGUF

## Resumen

`unfuse-Qwen3.8-27B-mmproj-GGUF` es el proyector de vision (mmproj) del modelo multimodal `Qwen/Qwen3.8-27B`, exportado a formato GGUF mediante la herramienta `convert_hf_to_gguf.py` de llama.cpp con la opcion `--mmproj`. Lo publica el usuario sartajbhuvaji como parte de la coleccion "unfuse", un conjunto de artefactos que separan el codificador visual del modelo de lenguaje para poder recombinarlos bajo llama.cpp. No es un modelo autonomo: es una pieza que debe emparejarse con un GGUF de texto del mismo modelo base.

El interes practico de este repositorio es que permite ejecutar inferencia multimodal de Qwen3.8-27B en el ecosistema llama.cpp, algo que normalmente requiere el modelo completo en formato nativo. El autor advierte explicitamente de que solo ha verificado que las piezas cargan y se comunican entre si (una imagen de un gato devolvio "cat" con decodificacion greedy), sin ninguna medicion de calidad visual.

El repositorio es muy pequeno (0,9 GB, un unico fichero F16 de 928 MB con 334 tensores) y las cifras de parametros que aparecen en los metadatos de HuggingFace (460.730.096) corresponden al recuento del propio proyector, no al modelo de lenguaje de 27B. La licencia declarada es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Proyector de vision (mmproj) para un transformer multimodal; exportado con llama.cpp |
| Parametros totales | 460.730.096 (recuento del fichero safetensors asociado al repo); el modelo base es de 27B |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16 (unico fichero publicado) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`mmproj-Qwen3.8-27B-F16.gguf`, 334 tensores) |

## Arquitectura y entrenamiento

El artefacto es unicamente la mitad codificadora visual del modelo `Qwen/Qwen3.8-27B`: el proyector que transforma las representaciones de imagen en tokens compatibles con el modelo de lenguaje. No incluye pesos del transformer de lenguaje ni se ha reentrenado; se ha convertido desde los pesos originales de Qwen con el commit `d02b4c0d66796e0a44380611d038123fefb9fe83` de llama.cpp. El nombre "unfuse" hace referencia a la operacion de desacoplar el modelo multimodal en dos ficheros GGUF (texto y vision) que luego se recombinan en tiempo de inferencia.

No hay informacion sobre datos de entrenamiento, numero de tokens, composicion del dataset ni procesos de RLHF/DPO en la documentacion proporcionada. Tampoco se detalla la arquitectura interna del codificador visual (tipo de ViT, resolucion de parche, estrategia de pooling) mas alla de que es el componente mmproj estandar de Qwen3.8-27B.

## Capacidades

- Procesamiento de imagenes: convierte entradas visuales en embeddings consumibles por el modelo de lenguaje emparejado.
- Inferencia multimodal imagen-texto cuando se combina con un GGUF de texto compatible (`unfuse-Qwen3.8-27B-text-GGUF`).
- Integracion con `llama-mtmd-cli` y el resto del ecosistema llama.cpp (multimodal tooling).
- Decodificacion greedy reproducible mediante `--temp 0`.
- No incluye por si mismo generacion de texto, razonamiento, codigo ni tool calling: esas capacidades dependen del GGUF de texto con el que se empareje.
- Idiomas soportados: no disponible (dependera del modelo de lenguaje emparejado).

## Casos de uso

- **Prototipado rapido de pipelines VLM en local**: emparejar este mmproj con el GGUF de texto Q4_K_M y lanzar `llama-mtmd-cli` para validar flujos de imagen-a-texto sin depender de frameworks pesados.
- **Despliegue en entornos con recursos limitados**: al separar vision y lenguaje en dos ficheros, se puede cuantizar agresivamente el texto (Q4_K_M) manteniendo el proyector en F16, lo que reduce el peso total frente a un unico GGUF multimodal.
- **Investigacion sobre separabilidad de componentes multimodales**: util para estudiar como afecta la cuantizacion del texto a la calidad de la comprension visual, manteniendo fijo el codificador.
- **Pruebas de integracion en llama.cpp**: verificar compatibilidad de versiones del runtime con modelos Qwen3.8-27B multimodales antes de comprometerse con un despliegue mayor.
- **Generacion de descripciones de imagen en batch offline**: con el par texto+vision se pueden procesar lotes de imagenes para etiquetado preliminar o indexacion, siempre que se valide la calidad previamente.
- **Base para fine-tuning o experimentos de adaptacion visual**: al estar el proyector aislado en GGUF, sirve como referencia para comparar contra variantes reentrenadas del mismo componente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo documenta una comprobacion cualitativa: una imagen de un gato con el texto Q4_K_M devolvio la respuesta "cat" en decodificacion greedy, lo que demuestra que las piezas cargan y se comunican, pero no mide calidad visual.

## Requisitos de hardware

- VRAM del proyector: aproximadamente 1 GB en F16 (fichero de 928 MB).
- VRAM total: depende del GGUF de texto emparejado; para un modelo de 27B en Q4_K_M se estiman del orden de 16-18 GB, mas el proyector.
- GPU recomendadas: RTX 4090 (24 GB) o superior para el par completo en Q4; A100/H100 para precisiones mayores o contextos largos.
- Cabe en GPU de consumo: si, con el texto en Q4_K_M en tarjetas de 24 GB; en 16 GB sera ajustado o requerira cuantizaciones mas agresivas.
- Opciones de despliegue: `llama-mtmd-cli` (documentado por el autor), llama.cpp en general; vLLM, TGI u Ollama no estan documentados para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| unfuse-Qwen3.8-27B-mmproj-GGUF | Proyector (460M en safetensors) | no disponible | GGUF mmproj | Apache 2.0 | Solo componente visual; requiere GGUF de texto |
| Qwen/Qwen3.8-27B (original) | 27B | no disponible | safetensors | Apache 2.0 | Modelo multimodal completo, referencia de calidad |
| unfuse-Qwen3.8-27B-text-GGUF | 27B (texto) | no disponible | GGUF | Apache 2.0 | Mitad de lenguaje del mismo split; se combina con este repo |

No se dispone de datos de rendimiento para establecer comparaciones cuantitativas con alternativas.

## Limitaciones y advertencias

- No es un modelo autonomo: sin el GGUF de texto emparejado no genera ninguna salida.
- La calidad visual no ha sido medida por el autor; la unica prueba es una imagen de un gato.
- Solo se publica en F16; no hay variantes cuantizadas del proyector.
- El recuento de parametros de los metadatos (460M) puede inducir a error: corresponde al proyector, no al modelo de 27B.
- Compatibilidad atada a una version concreta de llama.cpp (commit `d02b4c0d...`); cambios en el runtime pueden romper la carga.
- Riesgo de alucinacion y sesgos: heredados del modelo base Qwen3.8-27B, no evaluados en esta publicacion.
- Sin informacion sobre idiomas soportados ni limites de contexto.
- Uso comercial permitido por Apache 2.0, pero conviene revisar las condiciones del modelo base Qwen.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sartajbhuvaji/unfuse-Qwen3.8-27B-mmproj-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- GGUF de texto complementario: https://huggingface.co/sartajbhuvaji/unfuse-Qwen3.8-27B-text
- Coleccion unfuse: https://huggingface.co/collections/sartajbhuvaji/unfuse-6ae8b265e63951518e4e75cc
- llama.cpp (herramienta de conversion y runtime): https://github.com/ggml-org/llama.cpp
