# 2Beyes/Aurum_4b-safetensors

## Resumen

Aurum 4B Uncensored es un ajuste derivado de Qwen3.5-4B desarrollado por el usuario 2Beyes. No se trata de un reentrenamiento completo: el autor parte de los pesos oficiales de Qwen3.5-4B (incluida la torre de visión y la cabeza de predicción multi-token) y aplica únicamente una edición de pesos orientada a eliminar el comportamiento de rechazo. El resto de los pesos, el tokenizador y la plantilla de chat son los del modelo base o los de un modelo intermedio ablacionado.

El modelo está pensado para chat cotidiano y tool calling en tarjetas gráficas de 8 GB. Con 4.659.865.088 parámetros en formato safetensors y un repositorio de 9,3 GB, se posiciona como una opción ligera para despliegue local. La licencia es Apache 2.0 y el pipeline declarado es image-text-to-text, lo que indica que conserva la capacidad multimodal del modelo base.

Su relevancia actual radica en dos factores: por un lado, la eliminación quirúrgica de los rechazos mediante edición de direcciones singulares en los pesos de atención y FFN, sin incorporar el resto del fine-tuning del modelo donante; por otro, la publicación de cuantizaciones GGUF con matriz de importancia para llama.cpp, lo que facilita su uso en hardware de consumo. No obstante, el autor advierte explícitamente de que el modelo no incorpora ninguna salvaguarda y de que solo se ha probado en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal tipo Qwen3.5 (`Qwen3_5ForConditionalGeneration`), con torre de visión y cabeza MTP |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q3_K_M a Q8_0, BF16; proyector de visión incluido en el repo GGUF |
| Idiomas soportados | inglés (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) en el repo principal; GGUF en el repo secundario |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.5-4B, un transformer multimodal con torre de visión y una cabeza de predicción multi-token (MTP). El autor no describe cambios estructurales: conserva el layout de pesos de Qwen3.5, la torre de visión sin modificar y la cabeza MTP. El proceso de edición parte de la diferencia de pesos entre Qwen3.5-4B y el modelo `insraq/Qwen3.5-4B-EmperoAI-Qwen3.8-Distill-Heretic-Abliterated`, de la que se retiene únicamente la componente que elimina rechazos.

Concretamente, en las capas 4 a 31 se conservan las 8 direcciones singulares principales del cambio en los pesos de salida de atención (`self_attn.o_proj` / `linear_attn.out_proj`), que representan aproximadamente el 98 % de la modificación. En los pesos de salida del FFN (`mlp.down_proj`) se retiene una única dirección principal, solo en aquellos tensores donde concentra más de la mitad del cambio, y en la misma dirección que la edición de atención. El resto de cambios del modelo donante (su fine-tuning de destilación) no se incluye. La configuración, el tokenizador y la plantilla de chat provienen del modelo Heretic, con el mismo tokenizador que Qwen3.5. No se documentan datos de entrenamiento adicionales, número de tokens, ni etapas de RLHF o DPO propias.

## Capacidades

- Generación de texto conversacional en inglés.
- Razonamiento con modo thinking activable mediante `enable_thinking` en la plantilla de chat, igual que en Qwen3.5.
- Tool calling y function calling, con soporte evaluado en BFCL v3 (simple, multiple, parallel, parallel-multiple e irrelevance).
- Procesamiento de imagen y vídeo a través de la torre de visión heredada de Qwen3.5 (pipeline image-text-to-text).
- Predicción multi-token (MTP) conservada del modelo base.
- Comportamiento sin rechazos: 0 rechazos en 100 prompts dañinos según la model card.
- No se documentan capacidades de audio ni de agente multi-paso más allá del tool calling.

## Casos de uso

- Asistente de chat local en GPU de consumo: con cuantizaciones GGUF desde Q3_K_M y un peso de 4B, puede ejecutarse en tarjetas de 8 GB mediante llama.cpp, lo que lo hace adecuado para prototipos y uso personal en escritorio.
- Automatización de tool calling en pipelines internos: su puntuación BFCL v3 media de 85,9 en Q4_K_M con thinking desactivado lo sitúa como opción para enrutar llamadas a funciones en asistentes de productividad, con la cautela de revisar los resultados de las herramientas.
- Procesamiento de documentos con imagen: al conservar la torre de visión de Qwen3.5, puede emplearse para extraer información de capturas, formularios o diagramas en flujos de digitalización, usando el procesador de Qwen3.5-4B para el preprocesado.
- Generación de código asistida en entornos sin restricciones de contenido: útil en investigación sobre alineación y en entornos controlados donde se necesita estudiar el comportamiento del modelo sin capas de rechazo, no recomendado para producción orientada al público.
- Experimentación en investigación sobre ablación y edición de pesos: el repositorio incluye `build_log.json` con cada tensor modificado y la fracción de cambio retenida, lo que facilita reproducir y auditar el método.
- Evaluación comparativa de robustez ante prompts dañinos: sirve como referencia en estudios sobre tasas de rechazo, con la advertencia de que la medición del autor se basa en frases marcadoras y es una estimación.
- Despliegue en entornos air-gapped: al ser Apache 2.0 y publicarse en safetensors y GGUF, puede integrarse en infraestructura local sin dependencias de servicios en la nube.

## Benchmarks y rendimiento

Resultados publicados por el autor. Ambos modelos ejecutados como Q4_K_M en llama.cpp, con thinking desactivado, decodificación greedy y sin system prompt. El modelo anterior de referencia es `Qwen3.8-4B-Distill-Heretic-Abliterated` (Q4_K_M).

| Benchmark | Modelo anterior | Aurum 4B |
|---|---|---|
| IFEval, prompt strict / loose (541) | 72,8 / 75,8 | 78,6 / 81,5 |
| IFEval, instruction strict / loose | 81,3 / 83,8 | 85,3 / 87,5 |
| BFCL v3 non-live, media (1.240) | 68,7 | 85,9 |
| BFCL simple / multiple / parallel / parallel-multiple | 65,2 / 74,5 / 48,0 / 62,0 | 92,0 / 92,5 / 82,0 / 82,0 |
| BFCL irrelevance (sin herramienta cuando no procede) | 93,8 | 80,8 |
| MMLU-Redux 2.0 (5.330 preguntas) | 75,0 | 74,9 |
| GPQA Diamond (198, orden de respuestas aleatorizado con semilla fija) | 42,9 | 49,5 |

| Test de rechazos | Modelo anterior | Qwen3.5-4B oficial | Mezcla Aurum previa | Aurum 4B |
|---|---|---|---|---|
| Rechazos en 100 prompts dañinos (`mlabonne/harmful_behaviors`) | 0 | 72 | 20 | 0 |
| Sobrerrechazo: rechazos en 30 prompts inocuos × 3 muestras | 1,1 % | no disponible | 0 % | 0 % |

Notas del autor: las cifras publicadas por Qwen corresponden a BF16 con thinking largo y BFCL v4, por lo que no son directamente comparables. En GPQA se aplicó un límite de 3.072 tokens por respuesta; 84 de las 198 respuestas de Aurum alcanzaron el límite y se contaron como incorrectas (6 en el modelo anterior), por lo que la puntuación con un límite mayor sería probablemente superior. BFCL se puntuó con el verificador AST de `bfcl-eval` sobre generaciones propias. Los rechazos se cuentan con frases marcadoras, por lo que son una estimación.

## Requisitos de hardware

- VRAM estimada: en BF16, los 4,66B parámetros ocupan aproximadamente 9,3 GB de pesos, por lo que se necesita una GPU con al menos 12-16 GB para inferencia cómoda con caché KV. En Q8_0 ronda los 5 GB; en Q4_K_M, aproximadamente 2,8-3 GB de pesos.
- GPU recomendadas: A100, H100 o L40S para BF16 con contexto largo; RTX 4090 (24 GB) para BF16 sin problemas; RTX 3090/4080 (16-24 GB) para BF16 o Q8_0.
- GPU de consumo: sí cabe en tarjetas de 8 GB con cuantizaciones Q4_K_M o inferiores en llama.cpp, tal como indica el autor. En 6 GB sería necesario bajar a Q3_K_M.
- Opciones de despliegue: llama.cpp con los GGUF del repo `2Beyes/Aurum-4B-Uncensored-GGUF`; `transformers` con `AutoModelForImageTextToText` para safetensors (requiere versión con soporte de Qwen3.5); para texto, `AutoTokenizer` del propio repo. No se documenta soporte explícito de vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Multimodal | Notas |
|---|---|---|---|---|---|
| Aurum 4B Uncensored | 4,66B | no disponible | Apache 2.0 | Sí (visión) | Sin rechazos; BFCL v3 85,9 en Q4_K_M thinking off |
| Qwen3.5-4B (base) | 4B | no disponible | Apache 2.0 | Sí (visión) | 72 rechazos en 100 prompts dañinos; referencia de conocimiento |
| Qwen3.8-4B-Distill-Heretic-Abliterated | 4B | no disponible | no disponible | no disponible | Modelo anterior de referencia; BFCL v3 68,7; MMLU-Redux 75,0 |
| insraq/Qwen3.5-4B-EmperoAI-Qwen3.8-Distill-Heretic-Abliterated | 4B | no disponible | no disponible | no disponible | Donante de la edición de rechazos; incluye fine-tuning de destilación no incorporado en Aurum |

No se dispone de datos de contexto ni de benchmarks de los modelos comparables más allá de los publicados por el autor para el modelo anterior.

## Limitaciones y advertencias

- Modelo sin censura: no rechaza peticiones dañinas (0 de 100 en la prueba del autor). No debe desplegarse en entornos accesibles a personas que no hayan elegido explícitamente un modelo sin salvaguardas.
- La edición de rechazos no añade conocimiento ni seguridad de ningún tipo; solo elimina el comportamiento de negativa.
- Es un modelo de 4B: comete errores factuales y puede invocar herramientas cuando ninguna encaja (BFCL irrelevance 80,8, inferior al modelo anterior).
- Verbosidad en preguntas de razonamiento difíciles con thinking desactivado, lo que provoca truncamientos en límites de tokens (84 de 198 respuestas de GPQA alcanzaron el límite).
- Solo probado en inglés; no hay evidencia de calidad en castellano ni en otros idiomas.
- La medición de rechazos se basa en frases marcadoras, no en revisión manual, por lo que la tasa real puede diferir.
- Licencia Apache 2.0 heredada, lo que permite uso comercial, pero el autor no ofrece garantías y la responsabilidad del uso recae en el desplegador.
- El repositorio no incluye configuración de preprocesador de imagen propia: para visión debe usarse el procesador de Qwen3.5-4B.
- No se documentan sesgos específicos más allá de los heredados del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/2Beyes/Aurum_4b-safetensors
- GGUF para llama.cpp: https://huggingface.co/2Beyes/Aurum-4B-Uncensored-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo donante de la edición: https://huggingface.co/insraq/Qwen3.5-4B-EmperoAI-Qwen3.8-Distill-Heretic-Abliterated
- Modelo anterior de referencia (GGUF): https://huggingface.co/yachen4ever/Qwen3.8-4B-Distill-Heretic-Abliterated-GGUF
- Dataset de prompts dañinos usado en la evaluación: `mlabonne/harmful_behaviors` (referenciado en la model card)
