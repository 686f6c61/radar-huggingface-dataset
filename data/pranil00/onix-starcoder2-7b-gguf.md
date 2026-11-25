# pranil00/ONIX-starcoder2-7b-GGUF

## Resumen

ONIX-starcoder2-7b-GGUF es una cuantizacion en formato GGUF del modelo base bigcode/starcoder2-7b, publicada por el usuario pranil00 bajo la etiqueta "ONIX Community". El artefacto principal es un unico fichero con esquema de cuantizacion Q5_K_M (5,5 bits por peso) de 6,80 GB, generado con la herramienta run-any-model, un motor de optimizacion adaptativo orientado a ejecucion en hardware de consumo. El modelo esta pensado para generacion de texto y, por herencia del modelo base, para tareas de generacion de codigo.

El modelo base StarCoder2-7B lo desarrollo BigCode, una colaboracion entre Hugging Face y ServiceNow, y se entreno sobre The Stack v2. La model card del artefacto cuantizado declara 10.116.956.160 parametros, una cifra que no coincide con el tamano nominal de 7B del modelo base y que debe tratarse con cautela. La licencia declarada es Apache 2.0, lo que facilita el uso comercial, aunque el autor anade una clausula de exencion de responsabilidad adicional.

La relevancia de esta ficha es practica: permite ejecutar un modelo de codigo de la familia StarCoder2 en equipos con 8 GB de VRAM o en Apple Silicon con 7,14 GB de memoria unificada, a costa de una perdida de calidad declarada de aproximadamente el 2,5 por ciento. No obstante, la informacion tecnica disponible es escasa y parte de las metricas de la model card no son verificables de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia StarCoder2, decoder-only) |
| Parametros totales | 10.116.956.160 segun la model card del artefacto; el modelo base se denomina comercialmente como 7B |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 8.192 tokens en Apple Silicon y NVIDIA GPU; 4.096 tokens en CPU segun la model card del artefacto |
| Tipos de cuantizacion | Q5_K_M (5,5 bits por peso); unico fichero publicado |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero bigcode--starcoder2-7b-Q5_K_M.gguf) |

## Arquitectura y entrenamiento

El artefacto es una conversion a GGUF de bigcode/starcoder2-7b, un transformer decoder-only de la familia StarCoder2 entrenado por BigCode. La model card del artefacto no aporta detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO; esa informacion corresponde al modelo base y no se reproduce en la informacion disponible. El modelo base se asocia a The Stack v2 como corpus principal de codigo, aunque este dato no aparece explicitamente en la documentacion consultada.

La innovacion tecnica del artefacto no esta en la arquitectura, sino en el proceso de cuantizacion: se ha generado con run-any-model, un motor que aplica cuantizacion adaptativa al dispositivo y reporta metricas de telemetria. La model card incluye un informe que declara 32 de 32 capas aceleradas, un buffer de KV cache de 256 MB en FP16 y una retencion de calidad estimada del 97,5 por ciento respecto a FP16. Estas cifras proceden del propio autor y no se han validado de forma independiente.

## Capacidades

- Generacion de texto autoregresiva en ingles y otros idiomas no especificados.
- Generacion de codigo en multiples lenguajes de programacion, heredada del modelo base StarCoder2.
- Relleno de codigo (fill-in-the-middle) segun las capacidades del modelo base, aunque no se documenta en la model card del artefacto.
- Ejecucion local en CPU, GPU NVIDIA y Apple Silicon mediante llama.cpp, Ollama, LM Studio, Jan o Text-Generation-WebUI.
- Conversacion en terminal mediante el runner run-any-model con modo conversacional (-cnv).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking en la informacion disponible.

## Casos de uso

- Asistente de codigo en local para desarrolladores con GPU de consumo: con 8,30 GB de VRAM en una RTX 30/40/50 o 7,14 GB de memoria unificada en Apple Silicon, el modelo cabe integramente y permite autocompletado y generacion de funciones sin conexion.
- Prototipado rapido en portatiles sin GPU dedicada: la variante para CPU requiere 9,14 GB de RAM libre y soporta AVX2/AVX-512, lo que permite probar prompts y generar snippets en entornos de desarrollo modestos.
- Educacion y aprendizaje de programacion: el modelo puede explicar fragmentos de codigo y proponer ejercicios, ejecutandose en un portatil de estudiante sin coste de API.
- Integracion en pipelines de CI/CD para revision de codigo: al ser un GGUF ejecutable con llama.cpp, puede invocarse desde scripts para generar resumenes de diffs o sugerencias, siempre con validacion humana posterior.
- Generacion de tests unitarios: el modelo base StarCoder2 esta orientado a codigo, por lo que puede proponer casos de prueba a partir de firmas de funciones, con revision obligatoria por el riesgo de alucinacion.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse completamente en local, el codigo fuente no sale de la maquina, lo que encaja en equipos con politicas estrictas de confidencialidad.
- Chat tecnico en terminal: el runner run-any-model ofrece un modo conversacional que permite consultas rapidas sobre APIs o sintaxis sin salir de la shell.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye el informe de telemetria de cuantizacion, que no constituye una evaluacion de calidad del modelo:

| Metrica | FP16 (base) | Q5_K_M (artefacto) | Cambio |
|---|---|---|---|
| Precision | 16,0 bits/parametro | 5,5 bits/parametro | -65,6 % |
| Tamano de pesos | 19,79 GB | 6,80 GB | -65,6 % |
| KV cache | 256 MB (FP16) | 256 MB (FP16) | Sin cambio |
| RAM residente total | 20,12 GB | 7,14 GB | -64,5 % |
| Calidad estimada | 100 % | 97,5 % | -2,5 % |
| Capas aceleradas | 0 % | 32/32 | Optimo |

No se dispone de valores de MMLU, HumanEval, GSM8K ni de latencia o throughput medidos de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: 8,30 GB dedicados en NVIDIA GPU con contexto de 8.192 tokens.
- Apple Silicon: 7,14 GB de memoria unificada con aceleracion Metal nativa (M1/M2/M3/M4/M5).
- CPU: 9,14 GB de RAM libre con contexto de 4.096 tokens y soporte AVX2/AVX-512.
- GPU recomendadas: la model card cita las series RTX 30/40/50; no menciona A100, H100 ni otras GPU de datacenter.
- Cabe en GPU de consumo: si, en tarjetas con al menos 8 GB de VRAM (por ejemplo RTX 3060 Ti, RTX 4060 Ti, RTX 4070 y superiores).
- Opciones de despliegue: llama.cpp (llama-cli), Ollama mediante Modelfile, LM Studio, Jan, Text-Generation-WebUI y el runner run-any-model.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pranil00/ONIX-starcoder2-7b-GGUF | 10,12 B declarados (base 7B) | 8.192 (GPU/Apple), 4.096 (CPU) | Q5_K_M | Apache 2.0 | Hugging Face, 0 descargas |
| PrunaAI/starcoder2-7b-GGUF-smashed | 7 B (base) | no disponible | GGUF (varias, sin detallar) | Apache 2.0 | Hugging Face |
| second-state/StarCoder2-7B-GGUF | 7 B (base) | no disponible | GGUF (varias, sin detallar) | Apache 2.0 | Hugging Face |
| bigcode/starcoder2-7b (original) | 7 B | 16.384 tokens | safetensors FP16/BF16 | Apache 2.0 | Hugging Face, NVIDIA NIM |

Los tres artefactos GGUF derivan del mismo modelo base, por lo que las diferencias se limitan al esquema de cuantizacion, el proceso de conversion y la documentacion. El original en safetensors ofrece el contexto nativo mas amplio (16.384 tokens) y requiere aproximadamente 20 GB en FP16.

## Limitaciones y advertencias

- La cifra de parametros de la model card (10,12 B) no coincide con el tamano nominal de 7B del modelo base; conviene verificar el fichero antes de confiar en ella.
- La retencion de calidad del 97,5 por ciento es una estimacion del autor sin validacion independiente; no hay benchmarks publicados.
- Riesgo de alucinacion inherente al modelo base, especialmente en codigo de APIs poco comunes o librerias recientes.
- El contexto se reduce a 4.096 tokens en CPU, la mitad que en GPU, lo que limita tareas de analisis de repositorios completos.
- La model card no documenta sesgos conocidos ni la composicion del dataset de entrenamiento; el modelo base se entreno sobre codigo, con los sesgos de representacion que ello implica.
- El repositorio tiene 0 descargas y 0 likes, y fue creado en noviembre de 2026; no hay evidencia de uso comunitario ni de mantenimiento.
- La licencia Apache 2.0 permite uso comercial, pero la model card anade una clausula de exencion de responsabilidad total que no modifica la licencia y debe interpretarse con asesoramiento legal.
- No se documentan idiomas soportados; el rendimiento fuera del ingles no esta garantizado.
- El autor no es la organizacion BigCode ni ONIX oficial; es un usuario individual, lo que reduce la fiabilidad de mantenimiento y soporte.

## Enlaces

- Hugging Face del artefacto: https://huggingface.co/pranil00/ONIX-starcoder2-7b-GGUF
- Modelo base: https://huggingface.co/bigcode/starcoder2-7b
- Repositorio run-any-model: https://github.com/PranilShah-08/run-any-model
- Organizacion ONIX en Hugging Face: https://huggingface.co/ONIX
- Cuantizacion alternativa PrunaAI: https://huggingface.co/PrunaAI/starcoder2-7b-GGUF-smashed
- Cuantizacion alternativa second-state: https://huggingface.co/second-state/StarCoder2-7B-GGUF
- Ficha en local-ai-zone: https://local-ai-zone.github.io/models/starcoder2-7b.html
- NVIDIA NIM del modelo base: https://build.nvidia.com/bigcode/starcoder2-7b
