# danish-foundation-models/DFM-Mimir-v1.8

## Resumen

DFM-Mimir-v1.8 es un checkpoint de la familia HRM-Text desarrollado por Danish Foundation Models, un consorcio danes centrado en modelos de lenguaje para lenguas nordicas. Se trata de la continuacion del checkpoint XL en su version EMA en el paso 3.800.000, exportado como pesos de inferencia en BF16 con 1.786.775.040 parametros totales. No es la arquitectura Mini mas pequena, sino la variante XL de mayor capacidad.

El modelo emplea una arquitectura de computacion recurrente jerarquica (HRM, Hierarchical Recurrent Model) con objetivo de entrenamiento PrefixLM, lo que lo aleja del transformer decoder-only convencional. Su vocabulario es de 262.144 tokens (tokenizer completo de Gemma) y su contexto por defecto es de 4.096 tokens, aunque las evaluaciones se realizaron con una ventana ampliada a 8.192 tokens mediante override explicito.

Su relevancia actual radica en dos factores: por un lado, es uno de los pocos modelos abiertos entrenados especificamente sobre datos daneses con acuerdos de licencia (DBC/Lex.dk) ademas de fuentes publicas, lo que lo hace util para investigacion en lenguas de bajos recursos; por otro, su naturaleza arquitectonica atipica exige runtimes especificos (Transformers 5.17.0 y vLLM 0.31.0 con soporte HRM), lo que lo convierte en un caso de estudio interesante sobre portabilidad de arquitecturas no estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HRM-Text (Hierarchical Recurrent Model) con objetivo PrefixLM, H=2, L=3 |
| Parametros totales | 1.786.775.040 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens por defecto; 8.192 en configuracion de evaluacion |
| Tipos de cuantizacion | no disponible (exportado en BF16) |
| Idiomas soportados | no disponible (entrenado con mezcla DFM15/MTC v1.8, incluye material danes) |
| Licencia | Apache-2.0 (pesos); tokenizer sujeto a terminos upstream |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

HRM-Text sustituye el apilamiento plano de capas transformer por computacion recurrente jerarquica: la configuracion registra H=2 y L=3, es decir, dos niveles de recurrencia con tres iteraciones o capas internas por nivel. El objetivo de entrenamiento es PrefixLM, en el que una porcion inicial de la secuencia actua como prefijo con atencion bidireccional y el resto se genera de forma autoregresiva, lo que encaja con casos de continuacion condicionada y chat. El vocabulario de 262.144 tokens corresponde al tokenizer completo de Gemma, con renderizado nativo de chat y modo thinking desactivado.

La mezcla final de entrenamiento es DFM15 (MTC v1.8), que combina fuentes publicas con material respaldado por acuerdos con DBC y Lex.dk. La model card advierte explicitamente que las descargas publicas no bastan para reconstruir esa porcion del corpus. No se documentan en la informacion disponible el numero total de tokens vistos, la presencia de RLHF/DPO ni innovaciones adicionales como decodificacion especulativa o atencion lineal. El checkpoint publicado es el EMA del paso 3.800.000, sin estado del optimizador.

## Capacidades

- Generacion de texto autoregresiva con soporte de PrefixLM para continuaciones condicionadas.
- Conversacion multi-turno mediante plantilla de chat nativa (`chat_template.jinja`) con `enable_thinking=false`.
- Capacidad multilingue declarada en los tags del repositorio, aunque la lista concreta de idiomas no esta disponible.
- Integracion con servidor compatible con la API OpenAI a traves de vLLM con soporte HRM.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni razonamiento multi-paso explicito.
- No se documenta un modo thinking activo; de hecho, el despliegue recomendado lo desactiva por defecto.

## Casos de uso

- Investigacion en lenguas nordicas: el modelo se puede emplear para estudiar el comportamiento de arquitecturas recurrentes jerarquicas sobre danes, comparando su rendimiento con transformers decoder-only de tamano similar en tareas de EuroEval.
- Generacion de texto danes en dominios especializados: gracias a la inclusion de material de DBC y Lex.dk en el entrenamiento, es adecuado para prototipos de redaccion y resumen en contextos editoriales o lexicograficos daneses.
- Evaluacion comparativa de arquitecturas: sirve como baseline no convencional en estudios que midan el impacto del objetivo PrefixLM frente a causal LM estandar con el mismo tokenizer de Gemma.
- Servicio de chat experimental: con el comando vLLM documentado (puerto 8200, `max-model-len 8192`, `max-num-seqs 64`) se puede desplegar un endpoint compatible con OpenAI para pruebas internas de conversacion.
- Reproduccion de resultados de EuroEval: el repositorio incluye los resultados zero-shot y few-shot en `evaluations/`, lo que permite reproducir y auditar las evaluaciones publicadas.
- Analisis de tokenizacion: al usar el tokenizer completo de Gemma con `fix_mistral_regex=false`, es util para estudiar el efecto de la tokenizacion en modelos multilingues cuando se preserva la configuracion de entrenamiento.
- Fine-tuning controlado: con licencia Apache-2.0 sobre los pesos, se puede adaptar a tareas danesas especificas, siempre que se cuente con un runtime HRM compatible.

## Benchmarks y rendimiento

La model card menciona resultados de EuroEval zero-shot y few-shot en el directorio `evaluations/`, pero no se incluyen las cifras concretas en la informacion proporcionada. Tampoco se aportan resultados de MMLU, HumanEval, GSM8K ni comparaciones numericas con otros modelos.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1.786.775.040 parametros en BF16, los pesos ocupan aproximadamente 3,57 GB; el repositorio completo pesa 3,6 GB. A ello hay que sumar cache KV y overhead del runtime, por lo que se recomienda un minimo de 8-12 GB de VRAM para contexto corto y concurrencia baja.
- GPU recomendadas: el comando documentado usa `--tensor-parallel-size 1`, por lo que una sola GPU es suficiente. Una RTX 4090 (24 GB) o A100 40 GB cubren holgadamente el modelo con contexto de 8K y 64 secuencias concurrentes; una H100 no es necesaria salvo para mayor throughput.
- Cabe en GPU de consumo: si, en tarjetas con 12 GB o mas (RTX 3060 12 GB, RTX 4070, RTX 4090) para contexto moderado; con 8 GB el margen es ajustado.
- Opciones de despliegue: vLLM 0.31.0 con soporte HRM especifico (documentado); Transformers 5.17.0 con runtime HRM. No se documenta soporte en llama.cpp, Ollama ni TGI, y la model card advierte que una instalacion sin modificar no soporta esta arquitectura.
- Latencia y throughput estimados: no disponibles. El comando de referencia fija `--max-num-seqs 64`, `--max-num-batched-tokens 8192`, `--enforce-eager` y desactiva prefix caching y chunked prefill, lo que sugiere un rendimiento inferior al de un transformer estandar con las mismas optimizaciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DFM-Mimir-v1.8 | 1,79 B | 4.096 (8.192 en evaluacion) | HRM-Text / PrefixLM | Apache-2.0 | Hugging Face, runtime HRM requerido |
| Gemma 2 2B | 2,6 B | 8.192 | Transformer decoder-only | Gemma Terms | Hugging Face, ecosistema amplio |
| Qwen2.5 1.5B | 1,54 B | 32.768 | Transformer decoder-only | Apache-2.0 | Hugging Face, vLLM/llama.cpp/Ollama |
| SmolLM2 1.7B | 1,71 B | 8.192 | Transformer decoder-only | Apache-2.0 | Hugging Face, ecosistema amplio |

La comparativa se limita a parametros, contexto y licencia porque no hay cifras de benchmarks publicadas en la informacion disponible para DFM-Mimir-v1.8. Frente a las alternativas, la principal desventaja operativa es la necesidad de un runtime HRM especifico, mientras que la ventaja es su especializacion en datos daneses con acuerdos de licencia.

## Limitaciones y advertencias

- La model card reconoce explicitamente que el modelo puede producir respuestas incorrectas o no respaldadas; el riesgo de alucinacion no esta cuantificado.
- La cobertura de benchmarks (EuroEval) no garantiza capacidad general en todas las tareas o idiomas.
- Requiere un runtime HRM con soporte PrefixLM; Transformers 5.17.0 y vLLM 0.31.0 no bastan por si solos si no incluyen el soporte especifico. El repositorio no ofrece cargador automatico de codigo remoto.
- El contexto por defecto es de solo 4.096 tokens; ampliarlo a 8.192 exige un override de `max_position_embeddings` que reproduce la configuracion de evaluacion, no el comportamiento nativo exportado.
- Activar `fix_mistral_regex=true` altera la tokenizacion respecto al entrenamiento y a las evaluaciones reportadas; debe mantenerse en `false`.
- La licencia Apache-2.0 cubre los pesos, pero el tokenizer de Gemma y el material DBC/Lex.dk tienen terminos upstream propios que deben revisarse para uso comercial.
- El corpus de entrenamiento no es totalmente reproducible con descargas publicas, lo que limita la auditoria externa.
- No se documentan sesgos conocidos, pero la dependencia de fuentes danesas y de acuerdos editoriales sugiere un sesgo hacia ese dominio y lengua.
- El checkpoint es un EMA del paso 3.800.000 sin estado del optimizador, por lo que no esta pensado para reanudar entrenamiento directamente.
- El modelo esta marcado con 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/danish-foundation-models/DFM-Mimir-v1.8
- Repositorio HRM-Text: https://github.com/schneiderkamplab/HRM-Text
- Repositorio Mimir: https://github.com/schneiderkamplab/Mimir
