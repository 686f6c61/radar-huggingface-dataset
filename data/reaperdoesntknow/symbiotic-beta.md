# reaperdoesntknow/Symbiotic-Beta

## Resumen

Symbiotic-Beta (publicado internamente como SymLM) es un modelo de lenguaje experimental desarrollado por reaperdoesntknow, bajo la división de investigación de Convergent Intelligence LLC. Se presenta como un modelo híbrido simbolico-neural que combina un backbone transformer congelado (`Qwen2ForCausalLM` de Qwen2.5-0.5B) con una serie de modulos cognitivos simbolicos destinados al razonamiento interpretable y la memoria estructurada. El resultado es un checkpoint de aproximadamente 3.570 millones de parametros totales, lo que supone un incremento sustancial respecto a los 0.5B del modelo base, debido a la incorporacion de los modulos adicionales.

El modelo esta afinado sobre MetaMathQA (25.000 ejemplos) y declara uso de OpenThoughts2-1M en sus metadatos, orientandose a razonamiento matematico, generacion de demostraciones y experimentacion en IA neuro-simbolica. Su propuesta tecnica incluye componentes como DTE-HDM (memoria inspirada en ADN con codificacion helicoidal), M.A.S.R.M (mecanismos de respuesta simbiotica multiagente), QwenExoCortex y procesadores simbolicos como `ThoughtDynamicsLNN` o `Graph Reasoning with DNAConv`.

Es relevante ahora como ejemplo de investigacion abierta en integracion neuro-simbolica sobre modelos pequenos, si bien se encuentra en fase experimental, sin RLHF ni alineamiento, y con validacion empirica practicamente inexistente. No debe confundirse con un modelo listo para produccion: es un artefacto de investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con backbone congelado + modulos simbolicos adicionales (DTE-HDM, M.A.S.R.M, QwenExoCortex, procesadores LNN/Graph) |
| Parametros totales | 3.569.725.840 (segun safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del backbone Qwen2.5-0.5B, no confirmada en la model card) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no se declaran GGUF ni otras variantes) |
| Idiomas soportados | en (ingles) |
| Licencia | AFL-3.0 (Academic Free License 3.0) |
| Formato de pesos | safetensors (libreria transformers, PyTorch) |

## Arquitectura y entrenamiento

La arquitectura parte de `Qwen2ForCausalLM` (Qwen2.5-0.5B) como backbone congelado y anade capas de procesamiento simbolico: codificacion helicoidal con memoria inspirada en ADN (DTE-HDM), mecanismos de respuesta multiagente con attention gated (M.A.S.R.M), una proyeccion QwenExoCortex que mapea estados ocultos a un espacio de fusion simbolica, y procesadores especializados (`ThoughtDynamicsLNN`, procesadores Liquid/Crystalline, Graph Reasoning con DNAConv y una `ThoughtMemory` rolling). El autor menciona como fundamento teorico el "Analytic Foundations Theorem" (AFT), una propuesta de sustitucion measure-theoretic del calculo clasico, sin publicacion revisada por pares disponible en la informacion proporcionada.

El entrenamiento se realizo sobre 25.000 ejemplos de MetaMathQA, con learning rate 3e-5, batch total de 1024 (batch 16 x acumulacion 64), optimizador AdamW, scheduler coseno, warmup de 500 pasos, 3 epocas y precision mixta nativa (AMP). No se declara RLHF, DPO ni proceso de alineamiento alguno. Las versiones de framework indicadas son Transformers 4.51.3, PyTorch 2.7.0+cu126, Datasets 3.5.0 y Tokenizers 0.21.1. El autor indica que el checkpoint esta en fase experimental y no se documentan innovaciones de decodificacion (especulativa, atencion lineal, etc.) mas alla de los modulos simbolicos descritos.

## Capacidades

- Generacion de texto autoregresiva en ingles sobre el backbone Qwen2.
- Razonamiento matematico y generacion de demostraciones en formato simbolico, orientado por el ajuste sobre MetaMathQA.
- Q&A estructurado con logica de ecuaciones y inferencia paso a paso.
- Memoria de contexto a traves de `ThoughtMemory` rolling y codificacion helicoidal (DTE-HDM), segun la descripcion del autor.
- Modulacion de atencion y replay de memoria para investigacion en interfaces neuro-simbolicas.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes multi-step: no confirmado; la model card menciona "multi-agent symbiotic response mechanisms" como componente interno, no como capacidad de agente externo.
- Capacidades multilingues: limitadas al ingles.
- Capacidades especiales: modo thinking, vision o audio no disponibles.

## Casos de uso

- Investigacion en IA neuro-simbolica: el modelo sirve como banco de pruebas para estudiar la fusion entre estados ocultos de un transformer y modulos simbolicos (QwenExoCortex, DNAConv), permitiendo experimentar con modulacion de atencion y replay de memoria en un entorno controlado de 0.5B.
- Generacion asistida de demostraciones matematicas: dado su ajuste sobre MetaMathQA, puede emplearse para producir borradores de pruebas y pasos intermedios que un humano o un verificador formal revisa despues; nunca como fuente de verdad.
- Prototipado de kernels simbolicos para agentes reflexivos: los componentes DTE-HDM y M.A.S.R.M pueden reutilizarse como modulo de memoria en pipelines de agentes de investigacion, siempre con validacion externa.
- Experimentos de adaptacion con pocos datos: el diseno modular y la memoria proyectada permiten probar tecnicas de adaptacion de bajo coste sobre un backbone pequeno, util en entornos academicos con recursos limitados.
- Docencia y divulgacion: sirve para ilustrar en cursos de posgrado como se injertan modulos simbolicos sobre un LLM preentrenado y que limitaciones aparecen (fluidez sin correccion, alucinacion).
- Baseline para comparativas internas: al ser un checkpoint experimental con licencia permisiva, puede usarse como referencia en estudios comparativos frente a Qwen2.5-0.5B puro y otros modelos pequenos ajustados a matematicas.
- Analisis de robustez y alucinacion: su falta de RLHF lo convierte en un caso de estudio util para medir como se comporta un modelo sin alineamiento en tareas de razonamiento estructurado.

## Benchmarks y rendimiento

El autor declara en el `model-index` una entrada llamada "SymLM" con la lista de resultados vacia. No se han publicado resultados de benchmarks en la informacion disponible.

| Benchmark | SymLM | Referencia |
|---|---|---|
| MMLU | no disponible | no disponible |
| HumanEval | no disponible | no disponible |
| GSM8K | no disponible | no disponible |
| MetaMathQA (exact match) | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 7,2 GB solo para pesos (3,57B parametros x 2 bytes), mas overhead de activaciones y modulos auxiliares; en la practica, reservar 10-12 GB.
- VRAM estimada en cuantizacion 8 bits: en torno a 3,6-4 GB de pesos; en 4 bits: en torno a 1,8-2,2 GB. No se publican pesos cuantizados oficiales, por lo que habria que generarlos manualmente.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX A6000 para inferencia holgada en fp16 con contexto largo; RTX 4090 (24 GB) o RTX 3090 (24 GB) suficientes para fp16 con margen.
- Cabe en GPU de consumo: si, en RTX 4090, 4080, 3090, 3080 (12 GB) e incluso GPUs de 8 GB si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: `transformers` (via `AutoModelForCausalLM`, requiere cargar los modulos personalizados del repo), y potencialmente vLLM o TGI solo si los modulos simbolicos son compatibles con el grafo estandar, lo cual no esta confirmado. llama.cpp y Ollama no estan soportados de forma oficial al no existir GGUF publicado.
- Latencia y throughput: no disponibles. Al tratarse de un modelo de 3,57B con modulos adicionales, se espera un throughput inferior al de Qwen2.5-0.5B puro, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Symbiotic-Beta (SymLM) | 3,57B | no disponible | Neuro-simbolico experimental sobre Qwen2.5-0.5B | AFL-3.0 | Hugging Face, 3.051 descargas |
| Qwen2.5-0.5B (base) | 0,49B | 32.768 tokens (declarado por Qwen) | Transformer decoder-only denso | Apache 2.0 | Hugging Face, ampliamente adoptado |
| Qwen2.5-Math-1.5B | 1,5B | 4.096-32.768 tokens (segun variante) | Transformer denso especializado en matematicas | Apache 2.0 | Hugging Face |
| DeepSeek-R1-Distill-Qwen-1.5B | 1,5B | 32.768-131.072 tokens (segun configuracion) | Destilacion de razonamiento con modo thinking | MIT | Hugging Face |

La comparativa es orientativa: Symbiotic-Beta no publica metricas, por lo que la eleccion frente a alternativas como Qwen2.5-Math-1.5B o DeepSeek-R1-Distill-Qwen-1.5B deberia basarse en evaluacion propia. En madurez, soporte de herramientas y ecosistema, las alternativas superan claramente a Symbiotic-Beta.

## Limitaciones y advertencias

- Entrenamiento limitado: solo 25.000 ejemplos de MetaMathQA; el autor reconoce que no generaliza ampliamente.
- Sin RLHF ni alineamiento: no hay ajuste para seguridad ni para seguir instrucciones; los outputs pueden ser inseguros o incoherentes.
- Fluidez no implica correccion: el propio autor advierte que la fluidez simbolica no garantiza demostraciones matematicas validas; se recomienda verificacion externa.
- No optimizado para generacion abierta: prioriza logica y estructura sobre profundidad conversacional.
- Riesgo de alucinacion elevado por la ausencia de alineamiento y de evaluacion publica.
- Sesgos: no documentados; al entrenar sobre MetaMathQA en ingles, se esperan sesgos linguisticos y de dominio matematico.
- Idioma: solo ingles; no se declara soporte multilingue.
- Contexto: no se especifica en la model card; no debe asumirse la ventana del backbone sin verificacion.
- Licencia AFL-3.0: permite uso comercial con obligaciones de atribucion y reciprocidad limitada; revisar los terminos exactos antes de integrar en producto.
- Estado experimental: el autor indica explicitamente que el checkpoint esta en fase experimental; no apto para produccion sin validacion exhaustiva.
- Descargas y comunidad: 3.051 descargas y 1 like; soporte comunitario practicamente inexistente.
- Compatibilidad: al incluir modulos personalizados, la carga con `transformers` puede requerir `trust_remote_code` y versiones concretas de librerias; vLLM, TGI, llama.cpp y Ollama no estan confirmados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/Symbiotic-Beta
- Perfil del autor: https://huggingface.co/reaperdoesntknow
- Modelo base Qwen2.5-0.5B: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Dataset MetaMathQA: https://huggingface.co/datasets/meta-math/MetaMathQA
- Dataset OpenThoughts2-1M: https://huggingface.co/datasets/open-thoughts/OpenThoughts2-1M
- Modelo relacionado Symbiotic-1B: https://huggingface.co/reaperdoesntknow/Symbiotic-1B
- Modelo relacionado Symbiotic-8B: https://huggingface.co/reaperdoesntknow/Symbiotic-8B
- Modelo relacionado Symiotic-14B: https://huggingface.co/reaperdoesntknow/Symiotic-14B
- Modelo del mismo autor Qwen3-1.7B-Thinking-Distil: https://huggingface.co/reaperdoesntknow/Qwen3-1.7B-Thinking-Distil
- Modelo del mismo autor LFM2.5-1.2B-Distilled-SFT: https://huggingface.co/reaperdoesntknow/LFM2.5-1.2B-Distilled-SFT
- Modelo del mismo autor Qwen3-1.7B-Coder-Distilled-SFT: https://huggingface.co/reaperdoesntknow/Qwen3-1.7B-Coder-Distilled-SFT
- No se han encontrado papers, blogs ni demos externas del modelo en la busqueda web realizada.
