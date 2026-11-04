# BernardHood/Mistral-Nemo-12B-abliterated-LORA-Q8_0-GGUF

## Resumen

BernardHood/Mistral-Nemo-12B-abliterated-LORA-Q8_0-GGUF es un adaptador LoRA en formato GGUF, cuantizado a Q8_0, derivado del adaptador original nbeerbower/Mistral-Nemo-12B-abliterated-LORA. No se trata de un modelo completo, sino de un delta de pesos que debe aplicarse sobre un modelo base Mistral-Nemo-12B (12.000 millones de parametros, arquitectura transformer densa de Mistral AI) mediante la opcion `--lora` de llama.cpp. El adaptador incorpora la tecnica de "abliteration", que elimina o atenua los mecanismos de rechazo del modelo alineado original.

El artefacto es relevante para desarrolladores que quieran ejecutar un Mistral-Nemo sin las capas de rechazo sobre infraestructura llama.cpp, manteniendo el formato GGUF y la cuantizacion Q8_0 para preservar la mayor fidelidad numerica posible del adaptador. El repositorio es de tamano reducido (0,3 GB) y declara 245.912.576 parametros en safetensors, lo que corresponde al delta LoRA y no al modelo completo.

La ficha se elabora a partir de la informacion publica del repositorio; los datos no publicados se marcan explicitamente como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre transformer denso Mistral-Nemo-12B |
| Parametros totales | 245.912.576 (delta LoRA en safetensors; el modelo base es de 12B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en el repositorio; el modelo base Mistral-Nemo-12B soporta 128.000 tokens |
| Tipos de cuantizacion | Q8_0 (unico publicado en este repo) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (adaptador LoRA), safetensors (origen) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Mistral-Nemo-12B, un transformer decoder-only denso de Mistral AI y NVIDIA con 12.000 millones de parametros y ventana de contexto de 128.000 tokens. El delta LoRA se ha generado a partir del adaptador abliterated de nbeerbower, que aplica la tecnica de abliteration: identificar las direcciones de activacion asociadas al rechazo y proyectarlas fuera para reducir la tasa de respuestas negativas. El adaptador se ha convertido a GGUF mediante el espacio GGUF-my-lora de ggml.ai, que empaqueta el delta en formato compatible con llama.cpp y lo cuantiza a Q8_0.

No se dispone de informacion publica sobre el dataset de entrenamiento del adaptador, el numero de tokens utilizados, la composicion de los datos ni si se aplicaron etapas de RLHF o DPO. La unica innovacion tecnica documentada es el pipeline de conversion a GGUF y la posibilidad de cargar el adaptador en caliente sobre un modelo base con `llama-cli` o `llama-server`.

## Capacidades

- Generacion de texto y razonamiento general heredados del modelo base Mistral-Nemo-12B.
- Capacidad de codigo y matematicas propia del modelo base, no verificada en este adaptador.
- Soporte de tool calling y function calling heredado del formato de chat de Mistral-Nemo (no validado en este artefacto).
- Capacidad multilingue del modelo base (Mistral-Nemo soporta varios idiomas), sin lista publicada en este repositorio.
- Reduccion de rechazos por abliteration: el adaptador modifica el comportamiento de alineacion del modelo base.
- No incluye vision, audio ni modo de pensamiento explicito.
- Carga dinamica como LoRA en llama.cpp, sin necesidad de fusionar pesos.

## Casos de uso

- Investigacion sobre alineacion y seguridad: permite comparar el comportamiento del modelo base con y sin el adaptador abliterated en tareas de red teaming y evaluacion de refusal rates.
- Despliegue en llama.cpp: usar `llama-server -m base_model.gguf --lora adaptador.gguf` para servir un modelo con el adaptador cargado en caliente, sin recompilar ni fusionar pesos.
- Experimentacion con LoRA en produccion: validar el impacto del adaptador Q8_0 frente a la version safetensors del mismo delta antes de fusionar.
- Generacion creativa sin restricciones: escenarios de escritura de ficcion o roleplay donde el modelo base rechaza contenido sensible.
- Evaluacion de cuantizacion: comparar la fidelidad numerica del adaptador en Q8_0 frente a otras precisiones del mismo delta.
- Pruebas de robustez de pipelines: verificar que el stack de inferencia (llama.cpp, servidores compatibles con la API de OpenAI) carga correctamente adaptadores LoRA en GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador en si ocupa aproximadamente 0,3 GB en Q8_0; el consumo real depende del modelo base Mistral-Nemo-12B.
- Para el modelo base en FP16 se estiman unos 24 GB de VRAM; en Q8_0 unos 13 GB; en Q4_K_M unos 7-8 GB.
- GPU recomendadas para el conjunto base + adaptador: A100 40 GB, H100 80 GB o RTX 4090 24 GB para FP16; RTX 3090/4090 o RTX 4070 Ti para cuantizaciones Q4-Q8.
- Cabe en GPU de consumo (RTX 3060 12 GB, RTX 4060 Ti 16 GB) usando el base en Q4_K_M o Q5_K_M.
- Despliegue: llama.cpp (`llama-cli`, `llama-server`) con `--lora`; compatible con endpoints estilo OpenAI a traves de llama-server.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| BernardHood/Mistral-Nemo-12B-abliterated-LORA-Q8_0-GGUF | 245,9 M (delta LoRA) | depende del base (128k) | GGUF LoRA | Apache 2.0 | Requiere modelo base Mistral-Nemo-12B |
| nbeerbower/Mistral-Nemo-12B-abliterated-LORA | no disponible | depende del base | safetensors (PEFT) | Apache 2.0 | Adaptador original sin cuantizar |
| Mistral-Nemo-12B-Instruct (Mistral AI) | 12 B | 128k | safetensors, GGUF | Apache 2.0 | Modelo alineado de referencia |
| Mistral-Nemo-12B-abliterated (modelo fusionado) | 12 B | 128k | safetensors, GGUF | Apache 2.0 | Version fusionada del abliteration, sin necesidad de LoRA |

## Limitaciones y advertencias

- No es un modelo autonomo: requiere cargar el modelo base Mistral-Nemo-12B compatible con la version del adaptador.
- La abliteration elimina o reduce los rechazos de seguridad, lo que puede producir contenido danino, sesgado o no filtrado; no apto para entornos de produccion sin moderacion adicional.
- Riesgo elevado de alucinacion y de respuestas inseguras al desactivar la alineacion.
- No se documentan idiomas soportados ni evaluaciones de sesgo del adaptador.
- El repositorio no incluye informacion sobre la compatibilidad exacta con versiones de llama.cpp ni con el tokenizador/chat template del base.
- La licencia Apache 2.0 del adaptador no exime del cumplimiento de las condiciones del modelo base y de los datos de entrenamiento originales.
- El adaptador Q8_0 introduce una perdida de precision respecto al delta en safetensors, aunque menor que cuantizaciones mas agresivas.
- Sin descargas ni validacion comunitaria: no hay evidencia publica de que el artefacto funcione correctamente en todos los entornos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/BernardHood/Mistral-Nemo-12B-abliterated-LORA-Q8_0-GGUF
- Adaptador original: https://huggingface.co/nbeerbower/Mistral-Nemo-12B-abliterated-LORA
- Espacio GGUF-my-lora: https://huggingface.co/spaces/ggml-org/gguf-my-lora
- Documentacion de llama.cpp server: https://github.com/ggerganov/llama.cpp/blob/master/examples/server/README.md
- Modelo base Mistral-Nemo: https://huggingface.co/mistralai/Mistral-Nemo-Instruct-2407
