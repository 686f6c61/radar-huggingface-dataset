# Sleem247/qwen-legal-lora-rag-ft-Q8_0-GGUF

## Resumen

Sleem247/qwen-legal-lora-rag-ft-Q8_0-GGUF es un adaptador LoRA en formato GGUF, cuantizado a Q8_0, derivado del adaptador TinPhan2007/qwen-legal-lora-rag-ft, que a su vez se entrena sobre el modelo base Qwen/Qwen2.5-3B-Instruct. Lo publica el usuario Sleem247 y su proposito declarado es el ajuste fino para tareas legales con recuperacion aumentada (RAG). No se trata de un modelo completo, sino de un delta de pesos que debe aplicarse sobre el modelo base Qwen2.5-3B-Instruct en llama.cpp.

El interes practico es limitado pero claro: permite incorporar un ajuste legal sobre un modelo de 3B parametros sin reentrenar ni redistribuir los pesos completos, y ejecutarlo en hardware de consumo gracias a la cuantizacion Q8_0 del adaptador. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la model card es practicamente un stub generado automaticamente por el espacio GGUF-my-lora de ggml.ai.

La relevancia es baja como artefacto de produccion: no hay documentacion de datos de entrenamiento, benchmarks, licencia ni idiomas. Su valor es principalmente como ejemplo de pipeline LoRA a GGUF para despliegue local con llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre transformer decoder-only Qwen2.5-3B-Instruct |
| Parametros totales | 119.734.272 (pesos del adaptador, segun safetensors); el modelo base Qwen2.5-3B-Instruct tiene 3.090 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en el adaptador; el base Qwen2.5-3B-Instruct soporta 32.768 tokens (dato del modelo base, no verificado en este repo) |
| Tipos de cuantizacion | Q8_0 (unica variante publicada en este repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (adaptador LoRA); el repo original esta en formato PEFT |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de bajo rango convertido a GGUF mediante el espacio GGUF-my-lora de ggml.ai. El modelo subyacente es Qwen2.5-3B-Instruct, un transformer decoder-only con atencion por grupos (GQA) y RoPE, entrenado por Alibaba con tecnicas de SFT y RLHF/DPO segun la documentacion publica de la familia Qwen2.5. El adaptador se entrena con SFT (tag `sft` y libreria `trl`) sobre el repositorio TinPhan2007/qwen-legal-lora-rag-ft.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset legal, el regimen de hyperparametros LoRA (rango, alpha, modulos objetivo) ni si hubo etapas de alineacion adicionales. El nombre del adaptador sugiere un uso combinado con RAG (recuperacion de fragmentos legales y concatenacion en el prompt), pero no hay evidencia documentada en la model card. La cuantizacion Q8_0 del adaptador implica una perdida minima respecto a los pesos originales en FP16/BF16, aunque el impacto real depende de la sensibilidad del ajuste.

## Capacidades

- Generacion de texto en el dominio legal, presumiblemente orientada a consultas y respuestas sobre normativa, aunque no hay evaluacion publicada.
- Integracion con RAG: el nombre del adaptador indica un ajuste para responder con contexto recuperado, pero no se documenta el formato de prompt esperado.
- Herencia de capacidades del base Qwen2.5-3B-Instruct: razonamiento basico, generacion de codigo, matematicas elementales y soporte multilingue (principalmente ingles y chino, con castellano funcional).
- Soporte de tool calling y function calling heredado del base Qwen2.5-Instruct, no verificado tras el ajuste LoRA.
- Capacidad de agentes y razonamiento multi-paso: limitada por el tamano de 3B y no evaluada en este adaptador.
- Sin capacidades de vision, audio ni modo thinking explicito.

## Casos de uso

- Prototipado de asistentes legales en local: aplicar el adaptador sobre Qwen2.5-3B-Instruct en llama.cpp permite probar respuestas legales en una maquina de consumo sin depender de APIs, util para validar prompts y flujos RAG antes de invertir en modelos mayores.
- Demostracion de pipeline LoRA a GGUF: sirve como referencia tecnica para equipos que quieran convertir sus propios adaptadores PEFT a GGUF con GGUF-my-lora y desplegarlos con `llama-server`.
- Clasificacion y resumen de fragmentos normativos: con contexto recuperado, el adaptador puede resumir articulos o contratos en entornos de bajo recursos, siempre con revision humana.
- Generacion de borradores de respuestas a consultas frecuentes: en un chatbot interno de un despacho, combinado con una base vectorial de legislacion, para producir borradores que un abogado revisa.
- Extraccion de entidades y clausulas en documentos legales: el ajuste puede mejorar la adherencia al dominio frente al base, aunque sin benchmarks no hay garantia.
- Entorno educativo y de investigacion: analisis de como un ajuste LoRA de dominio especifico altera el comportamiento de un modelo de 3B, con coste de computo minimo.
- Despliegue en dispositivos con poca VRAM: al ser un adaptador Q8_0 de unos 0,1 GB, se puede cargar junto al base cuantizado en GPUs de 6-8 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el adaptador Q8_0 ocupa aproximadamente 0,1 GB; el modelo base Qwen2.5-3B-Instruct en Q4_K_M ronda 2 GB, en Q8_0 unos 3,3 GB y en FP16 unos 6,2 GB. Sumando overhead de contexto, un despliegue Q4_K_M requiere en torno a 3-4 GB de VRAM.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A10, L4 o A100 para mayor throughput. Cabe en GPUs consumer de 6-8 GB con cuantizacion Q4.
- Cabe en consumer GPU: si, en RTX 3060, RTX 4060, RTX 4070 y superiores con cuantizaciones Q4/Q5/Q8.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`) con `--lora`; no es compatible directamente con vLLM ni TGI sin convertir el adaptador a PEFT y fusionarlo. Ollama no soporta cargar adaptadores LoRA GGUF externos de forma nativa en todas las versiones.
- Latencia y throughput: no disponibles; en una RTX 4090 con Q4_K_M se puede esperar del orden de decenas de tokens por segundo para un modelo de 3B, pero no hay medicion publicada para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sleem247/qwen-legal-lora-rag-ft-Q8_0-GGUF | 119,7 M (adaptador) sobre 3B | no disponible | LoRA GGUF legal | no disponible | Hugging Face, 0 descargas |
| TinPhan2007/qwen-legal-lora-rag-ft | no disponible (adaptador PEFT) | no disponible | LoRA PEFT legal | no disponible | Hugging Face |
| Qwen/Qwen2.5-3B-Instruct | 3.090 M | 32.768 tokens | Modelo completo | Apache 2.0 (Qwen2.5) | Hugging Face, ampliamente usado |
| Sleem247/LEGAL_QWEN_REASONING-Q8_0-GGUF | no disponible | no disponible | GGUF legal del mismo autor | no disponible | Hugging Face |

## Limitaciones y advertencias

- Ausencia total de documentacion: no hay model card sustantiva, ni datos de entrenamiento, ni evaluacion, lo que impide validar la calidad del ajuste legal.
- Licencia no declarada: no se puede asumir uso comercial; ademas, la licencia del base Qwen2.5-3B-Instruct (Apache 2.0) debe respetarse por separado.
- Riesgo alto de alucinacion en materia legal: un modelo de 3B ajustado con SFT sobre datos no documentados no es fiable para asesoramiento juridico sin revision humana.
- El adaptador depende del base exacto Qwen2.5-3B-Instruct; aplicarlo sobre otras variantes o cuantizaciones del base puede degradar el resultado.
- Sin soporte nativo en vLLM/TGI: requiere fusion del adaptador o uso de llama.cpp, lo que limita el despliegue en infraestructura de alta concurrencia.
- Idiomas no declarados: el comportamiento en castellano de Espana no esta verificado y probablemente sea inferior al de modelos mayores.
- Repositorio sin traccion (0 descargas, 0 likes) y creado en 2026: no hay comunidad ni issues que permitan detectar problemas.
- Contexto efectivo limitado por el base (32.768 tokens teoricos) y por la ventana practica que soporte la cuantizacion y el servidor llama.cpp configurado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Sleem247/qwen-legal-lora-rag-ft-Q8_0-GGUF
- Adaptador original: https://huggingface.co/TinPhan2007/qwen-legal-lora-rag-ft
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Espacio GGUF-my-lora: https://huggingface.co/spaces/ggml-org/gguf-my-lora
- Documentacion de llama.cpp server: https://github.com/ggerganov/llama.cpp/blob/master/examples/server/README.md
- Otro modelo del mismo autor: https://huggingface.co/Sleem247/LEGAL_QWEN_REASONING-Q8_0-GGUF
