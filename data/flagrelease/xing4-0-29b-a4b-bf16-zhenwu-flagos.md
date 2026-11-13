# FlagRelease/Xing4.0-29B-A4B-BF16-zhenwu-FlagOS

## Resumen

Xing4.0-29B-A4B es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por China Telecom Artificial Intelligence Technology Co., Ltd., presentado como la nueva generacion de la familia Xingchen (Xingchen) orientada a la era de los agentes de IA. Se construye sobre la serie TeleChat1-3 y supone una actualizacion integral de la misma. El modelo combina un total de 29B parametros con solo 4B parametros activos por token, lo que permite un equilibrio entre capacidad y coste computacional en inferencia. La version publicada en este repositorio, `FlagRelease/Xing4.0-29B-A4B-BF16-zhenwu-FlagOS`, es una adaptacion multi-chip realizada por la comunidad FlagOS en el dia cero del lanzamiento, con pesos en BF16.

La relevancia tecnica del modelo reside en tres ejes: su arquitectura mHC+MLA+MTP, su ventana de contexto nativa de 256K tokens extensible a 512K, y su condicion de primer modelo de decenas de miles de millones de parametros entrenado integramente con potencia de calculo y frameworks domesticos (chinos). Esta disenado especificamente para escenarios de agente: tareas de horizonte largo, planificacion multi-paso, invocacion de herramientas y cadenas de razonamiento complejas.

El repositorio concreto que nos ocupa es una distribucion del modelo original adaptada al stack FlagOS, que unifica las capas de modelo, sistema y chip para permitir un flujo "desarrolla una vez, ejecuta en cualquier sitio" sobre aceleradores de diversos fabricantes. La adaptacion se ha verificado en nueve plataformas de chips (T-Head, NVIDIA, Moore Threads, Huawei Ascend, MetaX, Hygon, Iluvatar CoreX, Tsingmicro y ARM), siete de ellas en precision BF16 y ARM con una variante cuantizada W4A8.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con mHC+MLA+MTP (Mixture of Head Centers + Multi-head Latent Attention + Multi-Token Prediction) |
| Parametros totales | 31.215.031.088 (~29B nominales, 31,2B reales en safetensors) |
| Parametros activos | ~4B por token |
| Longitud de contexto | 256K tokens nativo, extensible a 512K |
| Tipos de cuantizacion | BF16 (esta version); W4A8 disponible para plataforma ARM |
| Idiomas soportados | Chino (zh) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con `custom_code` (requiere `trust_remote_code`) |
| Tamano del repositorio | 62,4 GB |
| Pipeline | no disponible |
| Fecha de creacion | 2026-09-17 |
| Ultima actualizacion | 2026-11-13 |

## Arquitectura y entrenamiento

Xing4.0-29B-A4B emplea una arquitectura de mezcla de expertos (MoE) sobre un transformer con tres componentes diferenciadores: mHC (Mixture of Head Centers), MLA (Multi-head Latent Attention) y MTP (Multi-Token Prediction). La combinacion de MLA reduce el coste de memoria de la cache KV en contextos largos, lo que resulta coherente con su ventana nativa de 256K tokens. MTP permite la prediccion de multiples tokens por paso, una tecnica habitual para acelerar la decodificacion. El modelo activa aproximadamente 4B parametros de los 29B totales por token procesado, lo que lo situa en la categoria de MoE eficiente en inferencia.

Segun la model card, se trata del primer modelo de decenas de miles de millones de parametros entrenado completamente con potencia de calculo y frameworks domesticos chinos. No se especifica en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La model card menciona que ha sido "profundamente optimizado para tareas de ingenieria complejas" y disenado para escenarios de agente, pero no detalla el proceso de alineacion. La adaptacion FlagOS anade una capa de portabilidad sobre el modelo original, con validacion de precision y verificacion de despliegue en nueve plataformas de chips.

## Capacidades

- Generacion de texto y razonamiento complejo en chino e ingles.
- Razonamiento matematico y resolucion de problemas de nivel competitivo (evaluado en Math-500).
- Razonamiento cientifico de nivel experto (evaluado en GPQA Diamond).
- Capacidades de agente: planificacion multi-paso, ejecucion de cadenas de razonamiento largas y tareas de horizonte largo.
- Invocacion de herramientas (tool calling / function calling) y soporte para flujos de agente.
- Modo de razonamiento explicito (reasoning parser `xing4_0` en vLLM).
- Contexto largo de 256K tokens, extensible a 512K, adecuado para documentos extensos y conversaciones multi-turno prolongadas.
- Capacidades multilingues limitadas a chino e ingles.
- Despliegue multi-chip mediante el stack FlagOS (nueve plataformas verificadas).

## Casos de uso

- Agentes autonomos de ingenieria de software: el modelo puede planificar tareas multi-paso, invocar herramientas de compilacion o testing y ejecutar cadenas de razonamiento largas gracias a su contexto de 256K tokens y su soporte de function calling, lo que lo hace adecuado para pipelines de CI/CD con intervencion minima.
- Atencion al cliente automatizada en chino e ingles: la ventana de contexto de 256K permite gestionar conversaciones multi-turno con historial extenso y documentacion de producto adjunta sin truncar informacion.
- Analisis de documentos largos: informes tecnicos, contratos o expedientes de decenas de miles de tokens pueden procesarse en una sola pasada, con razonamiento sobre el contenido completo en lugar de fragmentos.
- Razonamiento cientifico y matematico asistido: su rendimiento en GPQA Diamond (62,63) y Math-500 (84,80) lo hace util para tutoria avanzada, verificacion de derivaciones y resolucion de problemas de nivel universitario.
- Despliegue en infraestructura no-NVIDIA: la adaptacion FlagOS permite ejecutar el modelo en chips T-Head, Huawei Ascend, Moore Threads, MetaX, Hygon, Iluvatar CoreX, Tsingmicro y ARM, lo que resulta relevante para organizaciones con restricciones de suministro o requisitos de soberania tecnologica.
- Automatizacion de flujos de trabajo con herramientas: integracion en plataformas como AnythingLLM (documentada en la model card) para asistentes internos que consultan APIs, bases de datos o sistemas de ticketing mediante tool calling.
- Procesamiento por lotes de bajo coste: con solo 4B parametros activos, el coste por token en inferencia es sustancialmente menor que el de un modelo denso de 29B, lo que lo hace viable para cargas de trabajo de alto volumen en produccion.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible comparan la version original sobre NVIDIA con la adaptacion FlagOS sobre T-Head:

| Benchmark | Xing4.0-29B-A4B-Nvidia-Origin | Xing4.0-29B-A4B-T-Head-FlagOS |
|---|---|---|
| GPQA Diamond | 62,63 | 61,62 |
| Math-500 | 84,80 | 83,40 |

La diferencia entre ambas implementaciones es de aproximadamente 1 punto en GPQA Diamond y 1,4 puntos en Math-500, lo que indica una alineacion de precision razonable en la portabilidad a T-Head. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: los pesos ocupan aproximadamente 62,4 GB, por lo que se necesita al menos esa cantidad mas margen para cache KV y activaciones. Con contexto largo (100K tokens en la configuracion de ejemplo), el margen debe ser considerable.
- La configuracion de referencia de la model card usa `--tensor-parallel-size 4` con `--gpu-memory-utilization 0.8` y `--max-model-len 100000`, lo que implica al menos 4 aceleradores con memoria suficiente (del orden de 20-24 GB efectivos por dispositivo para los pesos, mas cache KV).
- GPU recomendadas: la model card documenta despliegue en T-Head, NVIDIA, Moore Threads, Huawei Ascend, MetaX, Hygon, Iluvatar CoreX, Tsingmicro y ARM. Para NVIDIA, la configuracion de 4 vias sugiere A100 40GB/80GB, H100 o similares.
- No cabe en una unica GPU de consumo en BF16. La variante W4A8 para ARM reduce el requisito de memoria, pero no se dispone de cifras concretas de VRAM para esa version.
- Opciones de despliegue: vLLM (documentado, con plugin FlagOS y `--reasoning-parser xing4_0`), contenedor Docker de FlagOS-T-Head, integracion con AnythingLLM. No se documenta soporte de llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles. La arquitectura MoE con 4B parametros activos y MTP sugiere un throughput superior al de un modelo denso de 29B, pero no se aportan mediciones.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible. A continuacion se ofrece una comparacion estructural con alternativas de la misma categoria (MoE de ~30B totales con ~3-4B activos), marcando como "no disponible" los datos que no se han podido verificar:

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xing4.0-29B-A4B | ~29B (31,2B reales) | ~4B | 256K (512K extensible) | Apache 2.0 | Hugging Face, ModelScope, 9 plataformas de chips |
| Qwen3-30B-A3B | ~30B | ~3B | no disponible en esta ficha | Apache 2.0 | Hugging Face |
| Mixtral 8x7B | ~47B | ~13B | 32K | Apache 2.0 | Hugging Face |

La comparativa con Qwen3-30B-A3B y Mixtral 8x7B se incluye solo como referencia estructural; no se dispone de resultados de benchmarks comparativos verificados en la informacion proporcionada.

## Limitaciones y advertencias

- Idiomas: solo chino e ingles. No hay soporte declarado de castellano ni de otros idiomas, lo que limita su uso en entornos hispanohablantes sin evaluacion previa.
- Riesgo de alucinacion: como todo modelo generativo, puede producir contenido plausible pero incorrecto, especialmente en tareas de razonamiento cientifico o matematico de alta dificultad. No se documentan tasas de alucinacion.
- Sesgos: no se documentan sesgos conocidos ni procesos de mitigacion en la informacion disponible. El entrenamiento con datos predominantemente chinos e ingleses puede introducir sesgos culturales y linguisticos.
- Contexto: aunque la ventana nativa es de 256K, el rendimiento en contextos muy largos no esta validado con benchmarks publicados. La configuracion de ejemplo limita `--max-model-len` a 100000, lo que sugiere precaucion practica.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion con atribucion, pero el modelo incluye `custom_code`, por lo que es necesario revisar el codigo remoto antes de desplegarlo en produccion.
- Dependencia de `trust_remote_code`: la carga requiere ejecutar codigo del repositorio, lo que implica un riesgo de seguridad que debe evaluarse en entornos controlados.
- Madurez del ecosistema: el repositorio tiene 17 descargas y 2 likes en el momento de la consulta, lo que indica una adopcion muy limitada y poca validacion independiente.
- Despliegue multi-chip: aunque se documentan nueve plataformas, la configuracion de referencia esta orientada a T-Head con contenedor Docker especifico; el soporte en otras plataformas puede requerir ajustes no documentados.
- Fechas: el repositorio fue creado el 2026-09-17 y actualizado el 2026-11-13, fechas futuras respecto a la mayoria de referencias actuales; conviene verificar la vigencia de los enlaces y artefactos.

## Enlaces

- Hugging Face: https://huggingface.co/FlagRelease/Xing4.0-29B-A4B-BF16-zhenwu-FlagOS
- FlagOS (stack de software): no disponible como URL en la informacion proporcionada
- FlagGems (libreria de operadores en Triton): https://github.com/openai/triton (referenciado en la model card como base de FlagGems)
- AnythingLLM: https://anythingllm.com/
- ModelScope: no disponible como URL directa en la informacion proporcionada; el comando de descarga es `modelscope download --model FlagRelease/Xing4.0-29B-A4B-BF16-zhenwu-FlagOS`
- Paper, blog o demo oficial: no disponibles en la informacion proporcionada
