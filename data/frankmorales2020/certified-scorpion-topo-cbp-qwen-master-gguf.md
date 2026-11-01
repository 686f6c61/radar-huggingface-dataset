# frankmorales2020/certified-scorpion-topo-cbp-qwen-master-GGUF

## Resumen

`certified-scorpion-topo-cbp-qwen-master-GGUF` es una exportación en formato GGUF (precisión bf16) del modelo `frankmorales2020/certified-scorpion-topo-cbp-qwen-master`, desarrollado por el autor frankmorales2020. Se trata de un fine-tuning de `Qwen/Qwen2.5-Coder-7B` (7.615.616.512 parámetros) al que se ha aplicado un marco de aprendizaje continuo denominado Topological Continual Backpropagation (Topo-CBP), cuyo objetivo declarado es resolver el dilema estabilidad-plasticidad sin recurrir a LoRA, adaptadores ni expansión de parámetros.

El modelo está especializado en cribado bioquímico computacional: reproduce una campaña de screening de candidatos a péptidos unidores frente a la neurotoxina de escorpión AaHII, clasificando secuencias como unidores positivos o señuelos negativos. Según su model card, los resultados habrían sido validados en laboratorio húmedo en el contexto del benchmark experimental de Anthropic, con una especificidad del 100 % sobre los decoys.

Su relevancia práctica reside en que empaqueta esa campaña de descubrimiento biológico en un binario GGUF ejecutable en hardware de consumo (una sola GPU o Apple Silicon de 24 GB o más), mediante `llama.cpp`, `ollama` o `llama-cpp-python`, con verificación de deriva de parámetros nula (Δ_drift = 0.000000000000) bajo semilla determinista 123. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2ForCausalLM (GGUF BF16) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no se indica arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 sin cuantizar (14,19 GB por archivo); no se listan otras variantes |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo `certified-scorpion-topo-qwen-bf16.gguf`, 14,19 GB; 15,2 GB sin comprimir en disco) |

## Arquitectura y entrenamiento

El modelo parte del backbone `Qwen/Qwen2.5-Coder-7B` en bfloat16, un transformer decoder-only de la familia Qwen2.5 orientado a codigo. Sobre ese backbone se aplica el marco Topological Continual Backpropagation (Topo-CBP), descrito en la model card como una solucion al dilema estabilidad-plasticidad. Sus componentes declarados son: anclaje de coordenadas mediante "prime coordinate manifold clamping" sobre el conjunto P = {2, 3, 5, 7, 11, 13} y un factor de atenuacion dinamico de Euler (Λ), mecanismos que supuestamente eliminan el olvido catastrofico sin LoRA, adaptadores ni expansion de parametros. La cabeza de tarea es una proyeccion de readout mapeada a estados binarios de afinidad (unidor `Positive` frente a senuelo `Negative`).

No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas como RLHF o DPO. La model card indica que el checkpoint condensa una campana de computo biofisico de alto coste en un binario de 7B ejecutable en el borde, y que la verificacion de invariancia en hardware confirma deriva de parametros nula (Δ_drift = 0.000000000000) con semilla determinista 123.

## Capacidades

- Clasificacion binaria de secuencias peptidicas como candidatas a unidor (`Positive`) o senuelo (`Negative`) frente al objetivo AaHII, mediante margenes logit calibrados.
- Generacion de texto conversacional heredada del modelo base Qwen2.5-Coder-7B (pipeline `text-generation`).
- Inferencia local determinista y reproducible en formato GGUF mediante `llama.cpp`, `ollama` y `llama-cpp-python`.
- Ejecucion en el borde (edge) sobre una sola GPU o Apple Silicon de gama alta, sin dependencia de servicios en la nube.
- No se documenta soporte de tool calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Cribado computacional de peptidos unidores: evaluacion de bibliotecas de secuencias candidatas frente a la neurotoxina AaHII, con clasificacion binaria calibrada por margen logit; segun la model card, logra 100 % de especificidad sobre decoys y 97,63 % de concordancia global en la biblioteca de 211 constructos.
- Reproduccion de campañas de descubrimiento biofisico en hardware de consumo: permite replicar el benchmark experimental de AaHII (211 constructos) localmente sin clusters, gracias al binario GGUF de 14,19 GB.
- Investigacion en aprendizaje continuo: sirve como artefacto de estudio del marco Topo-CBP y de tecnicas de preservacion de parametros (deriva nula verificada en silicio), util para grupos que investigan olvido catastrofico sin adapters.
- Comparacion de pipelines de inferencia determinista: los notebooks publicados cubren la conversion GGUF, el despliegue con llama.cpp y la ejecucion en contenedor udocker, lo que lo hace util como referencia para pipelines reproducibles de extremo a extremo.
- Despliegue soberano en entornos aislados: al ser un unico binario GGUF ejecutable con ollama o llama-server, puede usarse en laboratorios sin salida a internet para evaluaciones de afinidad.
- Prototipado rapido de endpoints de inferencia: `llama-server` permite levantar endpoints compatibles con la API de OpenAI con offload completo a GPU para integrar el modelo en scripts de analisis bioinformatico.

## Benchmarks y rendimiento

Datos publicados en la model card sobre la biblioteca experimental de la neurotoxina de escorpion AaHII (211 constructos):

| Metrica | Valor medido |
|---|---|
| Constructos evaluados | 211 |
| Especificidad sobre decoys (TNR) | 100,00 % (194/194), FDR = 0,00 % |
| Sensibilidad de unidores (recuperacion argmax) | 70,59 % (12/17) |
| Concordancia global de la biblioteca | 97,63 % |
| Discriminacion de controles (ROC-AUC) | 1,0000 |
| Margen de decision optimo (Δ) | +1,4799 (Youden's J = 1,0000) |
| Deriva de parametros en silicio | Δ_drift = 0,000000000000 |

No se han publicado resultados de benchmarks genericos (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 14,2 GB solo para los pesos en BF16, mas overhead de contexto y KV cache; en la practica se recomiendan GPU con 16-24 GB de VRAM o mas.
- GPU recomendadas (segun la model card): NVIDIA A100, L4, RTX 3090 o RTX 4090.
- Consumer GPUs: cabe en una RTX 3090 o RTX 4090 (24 GB) con offload completo; con offload parcial puede ejecutarse en GPUs de menor VRAM sacrificando velocidad.
- Apple Silicon: viable en equipos M-series con 24 GB o mas de memoria unificada, segun la model card.
- Opciones de despliegue: `ollama` (ejecucion directa desde Hugging Face Hub), `llama.cpp` / `llama-server` (endpoint local compatible con OpenAI con offload a GPU) y `llama-cpp-python`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Enfoque | Licencia |
|---|---|---|---|---|
| certified-scorpion-topo-cbp-qwen-master-GGUF | 7,62 B | GGUF BF16 | Clasificacion de afinidad peptidica (Topo-CBP sobre Qwen2.5-Coder-7B) | Apache 2.0 |
| Qwen/Qwen2.5-Coder-7B (base) | 7,62 B (aprox.) | Safetensors | Generacion de codigo general | Apache 2.0 |
| frankmorales2020/certified-scorpion-topo-cbp-qwen-master | 7,62 B | Safetensors (PyTorch) | Mismo modelo en formato original, sin conversion GGUF | Apache 2.0 |

No se dispone de datos de rendimiento comparativo directo con otros modelos de cribado de peptidos en la informacion proporcionada.

## Limitaciones y advertencias

- Alcance muy especializado: la cabeza de tarea y la validacion publicada se refieren exclusivamente al objetivo AaHII y a la biblioteca de 211 constructos de Anthropic; no hay evidencia publicada de generalizacion a otros objetivos proteicos.
- El archivo distribuido esta en BF16 sin cuantizar (14,19 GB), lo que limita su uso en GPUs de menos de 16-24 GB de VRAM; no se ofrecen variantes cuantizadas (Q4, Q5, etc.) en la informacion disponible.
- Idioma: el modelo esta etiquetado solo para ingles; no hay soporte documentado para castellano ni otros idiomas.
- La sensibilidad sobre unidores reales es del 70,59 % (12/17), es decir, aproximadamente un 29 % de los unidores validados en laboratorio no se recuperan en modo zero-shot; los resultados positivos deben confirmarse experimentalmente.
- Las afirmaciones de validacion en laboratorio humedo y de especificidad perfecta proceden de la model card del autor y no han sido verificadas de forma independiente; conviene tratarlas con escepticismo hasta su replicacion.
- Riesgo de alucinacion: no disponible; al heredar de un modelo de codigo generico, su comportamiento en tareas conversacionales fuera del dominio de clasificacion no esta documentado.
- Longitud de contexto: no disponible; no puede garantizarse el manejo de documentos largos.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion, con obligacion de conservar avisos de licencia; no se identifican restricciones adicionales.
- Popularidad muy baja (603 descargas, 0 likes en el momento de la ficha), lo que implica escasa validacion comunitaria y posible ausencia de correcciones o revisiones por terceros.

## Enlaces

- Modelo GGUF: https://huggingface.co/frankmorales2020/certified-scorpion-topo-cbp-qwen-master-GGUF
- Modelo base PyTorch: https://huggingface.co/frankmorales2020/certified-scorpion-topo-cbp-qwen-master
- Modelo base original: https://huggingface.co/Qwen/Qwen2.5-Coder-7B
- Notebook de conversion GGUF (GitHub): https://github.com/frank-morales2020/AST/blob/main/gguf_topo_cbp.ipynb
- Notebook de llama.cpp (GitHub): https://github.com/frank-morales2020/AST/blob/main/LLAMAdotCPP_TOPO_CBP.ipynb
- Notebook de udocker (GitHub): https://github.com/frank-morales2020/AST/blob/main/UDOCKER_TOPO_CBP.ipynb
- Articulo en Medium (arquitectura de permanencia): https://medium.com/ai-simplified-in-plain-english/the-architecture-of-permanence-invariant-foundations-asymmetric-compute-and-the-rise-of-b75378f9f35e
- Articulo en Medium (pipeline determinista extremo a extremo): https://medium.com/ai-simplified-in-plain-english/technical-report-end-to-end-deterministic-pipeline-architecture-for-qwen2-5-coder-7b-acd9cef957ef
- Articulo en Medium (stack PyTorch a udocker): https://medium.com/ai-simplified-in-plain-english/architectural-permanence-and-sovereign-execution-the-pytorch-to-udocker-topo-cbp-stack-da5c559c27e0
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
