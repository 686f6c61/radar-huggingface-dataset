# pranil00/ONIX-granite-3.0-2b-instruct-GGUF

## Resumen

ONIX-granite-3.0-2b-instruct-GGUF es una cuantizacion en formato GGUF del modelo ibm-granite/granite-3.0-2b-instruct de IBM, publicada por el usuario pranil00 bajo la etiqueta de la comunidad ONIX. El artefacto emplea el esquema de cuantizacion Q5_K_M (5,5 bits por peso) y reduce el peso de 5,15 GB en FP16 a 1,77 GB, lo que supone una compresion del 65,6 % y permite ejecutar el modelo en hardware de consumo sin GPU dedicada de gama alta.

El modelo base es un transformer decoder-only de 2.634.199.040 parametros (aproximadamente 2,63 mil millones), orientado a generacion de texto e instrucciones. Esta ficha describe principalmente el artefacto cuantizado y su perfil de despliegue, ya que la model card publicada se centra en los requisitos de memoria y los comandos de ejecucion mas que en los detalles de entrenamiento del modelo original.

La relevancia de esta publicacion es practica: ofrece un artefacto listo para usar en llama.cpp, Ollama, LM Studio o Jan, con requisitos de memoria declarados (2,12 GB en Apple Silicon, 3,27 GB de VRAM en NVIDIA, 4,12 GB de RAM en CPU) y una retencion de calidad estimada del 97,5 % respecto al modelo en FP16. El repositorio no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (decoder-only), familia del modelo base granite-3.0-2b-instruct |
| Parametros totales | 2.634.199.040 (2,63 mil millones) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 8.192 tokens en Apple Silicon y NVIDIA GPU; 4.096 tokens en CPU (segun la model card del artefacto) |
| Tipos de cuantizacion | Q5_K_M (5,5 bits por peso); no se publican otros esquemas en este repositorio |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero `ibm-granite--granite-3.0-2b-instruct-Q5_K_M.gguf`, 1,77 GB) |

## Arquitectura y entrenamiento

El artefacto es una conversion cuantizada del modelo base ibm-granite/granite-3.0-2b-instruct, que pertenece a la familia de transformers decoder-only de IBM Granite 3.0. La model card del repositorio no aporta informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo original; esos datos corresponden a la documentacion oficial de IBM, no incluida en la informacion disponible.

La innovacion tecnica de esta publicacion es el proceso de cuantizacion realizado con la herramienta run-any-model, descrita por el autor como un motor de optimizacion de LLM adaptativo al dispositivo. Segun la auditoria incluida en la model card, la conversion aplica aceleracion de capas completa (40/40 capas) y mantiene el buffer de KV cache en FP16 (320 MB), con una precision efectiva de 5,5 bits por parametro. El autor declara una retencion de calidad cognitiva del 97,5 % frente al modelo en FP16, aunque no se documenta la metodologia de esa medicion.

## Capacidades

- Generacion de texto e instrucciones en el formato del modelo base granite-3.0-2b-instruct (chat con plantilla de turnos y tokens de parada `<|im_end|>` y `<|endoftext|>`).
- Ejecucion en modo conversacional mediante llama.cpp (`-cnv`), Ollama, LM Studio, Jan o Text-Generation-WebUI.
- Despliegue multiplataforma: Metal en Apple Silicon, CUDA en GPU NVIDIA y AVX2/AVX-512 en CPU.
- Ajuste de parametros de muestreo en los ejemplos de la model card (temperature 0.7, top_p 0.9).
- Capacidades especificas del modelo base (codigo, matematicas, tool calling, multilingue) no documentadas en la informacion proporcionada.

## Casos de uso

- Prototipado local en portatiles Apple Silicon: con 2,12 GB de memoria unificada y aceleracion Metal, el modelo permite iterar sobre prompts y plantillas de chat sin conexion a servicios en la nube.
- Asistentes de terminal para desarrolladores: integrado con llama.cpp en modo conversacional, sirve para generar fragmentos de codigo, explicar comandos o redactar mensajes de commit en un flujo de trabajo offline.
- Despliegue en estaciones de trabajo con GPU de consumo: con 3,27 GB de VRAM encaja en tarjetas de la serie RTX 30/40/50, lo que permite servir una API de generacion de texto ligera con Ollama.
- Clasificacion y extraccion de texto en pipelines por lotes: el tamano reducido del GGUF y su ejecucion en CPU con AVX2 permiten procesar volumenes moderados de documentos en servidores sin GPU.
- Educacion e investigacion: el artefacto facilita experimentos reproducibles sobre cuantizacion y evaluacion de calidad en hardware asequible, comparando la salida Q5_K_M con el modelo FP16.
- Base para ajustes y demos de agentes: al ser un modelo de 2,63 mil millones de parametros con licencia Apache 2.0, puede servir como componente de razonamiento en demos de agentes ligeros o como fallback local en aplicaciones con requisitos de privacidad.

## Benchmarks y rendimiento

La model card incluye una matriz de auditoria del proceso de cuantizacion, no benchmarks de tareas (MMLU, HumanEval, GSM8K). Los datos disponibles son de perfil de memoria y compresion:

| Metrica | Baseline (FP16) | Cuantizado (Q5_K_M) | Cambio |
|---|---|---|---|
| Precision en bits por parametro | 16,0 | 5,5 | -65,6 % |
| Tamano de pesos | 5,15 GB | 1,77 GB | -65,6 % |
| Buffer de KV cache | 320,0 MB (FP16) | 320,0 MB (FP16) | Optimizado |
| RAM residente total | 5,50 GB | 2,12 GB | -61,5 % |
| Calidad estimada | 100,0 % | 97,5 % | -2,5 % |
| Aceleracion de capas | 0 % (riesgo de fallo) | 40/40 capas | Optimo |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada segun la model card: 2,12 GB de memoria unificada en Apple Silicon (M1/M2/M3/M4/M5), 3,27 GB de VRAM dedicada en GPU NVIDIA RTX 30/40/50 y 4,12 GB de RAM libre en CPU x86 con AVX2/AVX-512.
- Contexto recomendado: 8.192 tokens en Apple Silicon y NVIDIA GPU; 4.096 tokens en CPU.
- GPU recomendadas: cualquier GPU NVIDIA de las series RTX 30/40/50 con al menos 3,27 GB de VRAM; no se especifican modelos de datacenter (A100, H100) en la informacion disponible.
- Cabe en GPU de consumo: si, segun los requisitos declarados para las series RTX 30/40/50.
- Opciones de despliegue: run-any-model CLI, Ollama (mediante Modelfile), llama.cpp (`llama-cli -m ... -c 4096 -ngl 99 -cnv`), LM Studio, Jan y Text-Generation-WebUI.
- Latencia y throughput: no disponibles; la model card no publica mediciones de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ONIX-granite-3.0-2b-instruct-GGUF (Q5_K_M) | 2,63 mil millones | 8.192 tokens (GPU/Metal), 4.096 (CPU) | GGUF, 1,77 GB | Apache 2.0 | Hugging Face (0 descargas) |
| ibm-granite/granite-3.0-2b-instruct (FP16) | 2,63 mil millones | no disponible en esta ficha | safetensors (modelo base) | Apache 2.0 | Hugging Face (oficial de IBM) |
| Alternativas de ~2-3B en GGUF (p. ej. Qwen2.5-3B-Instruct-GGUF, Llama-3.2-3B-Instruct-GGUF) | ~3 mil millones | no disponible en esta ficha | GGUF | variable (Apache 2.0 / licencia comunitaria Llama) | Hugging Face |

La comparacion cuantitativa de rendimiento con alternativas no esta disponible: la model card no incluye benchmarks de tareas que permitan contrastar con otros modelos de la misma categoria.

## Limitaciones y advertencias

- No se documentan sesgos conocidos del modelo base ni del artefacto cuantizado en la informacion proporcionada.
- Riesgo de alucinacion inherente a los modelos de 2,63 mil millones de parametros; la model card no incluye evaluaciones de factualidad.
- La cuantizacion Q5_K_M introduce una perdida de calidad estimada del 2,5 % segun el autor, sin metodologia de medicion publicada; conviene validar las salidas frente al modelo FP16 en tareas criticas.
- El contexto maximo practico se reduce a 4.096 tokens en ejecucion por CPU, lo que limita casos de uso con documentos largos en ese entorno.
- No se especifican los idiomas soportados; el comportamiento multilingue debe evaluarse empiricamente antes de usarlo en produccion.
- La licencia del artefacto se declara Apache 2.0, mientras que la model card menciona "Apache 2.0 / MIT" de forma ambigua; para uso comercial conviene verificar la licencia del modelo base de IBM.
- El repositorio no registra descargas ni likes y fue creado y actualizado el mismo dia, sin historial de mantenimiento; no hay garantia de soporte o actualizaciones.
- La model card incluye un descargo de responsabilidad absoluto que traslada al usuario toda la responsabilidad sobre la validacion de las salidas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pranil00/ONIX-granite-3.0-2b-instruct-GGUF
- Modelo base: https://huggingface.co/ibm-granite/granite-3.0-2b-instruct
- Herramienta de cuantizacion run-any-model: https://github.com/PranilShah-08/run-any-model
- Organizacion ONIX en Hugging Face: https://huggingface.co/ONIX
