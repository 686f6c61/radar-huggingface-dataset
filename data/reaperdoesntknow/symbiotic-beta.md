# reaperdoesntknow/Symbiotic-Beta

## Resumen

Symbiotic-Beta (publicado por el autor como SymLM) es un modelo de lenguaje experimental desarrollado por reaperdoesntknow, dentro del catálogo de Convergent Intelligence LLC (Research Division). Se presenta como un modelo híbrido simbólico-neural que combina un backbone transformer congelado (`Qwen2ForCausalLM`) con un conjunto de módulos cognitivos simbólicos orientados al razonamiento interpretable. El checkpoint está afinado sobre MetaMathQA y OpenThoughts2-1M, con foco declarado en razonamiento matemático y Q&A simbólico.

El modelo parte de Qwen2.5-0.5B como base, aunque el repositorio de safetensors declara 3.569.725.840 parámetros totales, lo que sugiere que los módulos simbólicos añadidos incrementan sustancialmente el tamaño respecto al backbone original. La longitud de contexto no está declarada en la información disponible; el modelo base Qwen2.5-0.5B soporta 32.768 tokens, pero no se confirma que ese límite se mantenga tras la fusión simbólica.

Su relevancia es principalmente de investigación: propone una arquitectura neuro-simbólica con mecanismos como DTE-HDM (memoria inspirada en ADN y codificación helicoidal), M.A.S.R.M (mecanismos de respuesta simbiótica multiagente) y procesadores simbólicos (ThoughtDynamicsLNN, DNAConv, ThoughtMemory). No es un modelo orientado a producción: el autor lo describe como experimental, sin RLHF ni alineamiento, y entrenado sobre un volumen limitado de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida simbólico-neural sobre transformer decoder-only (`Qwen2ForCausalLM`) con módulos simbólicos (DTE-HDM, M.A.S.R.M, QwenExoCortex, ThoughtDynamicsLNN, DNAConv, ThoughtMemory) |
| Parametros totales | 3.569.725.840 |
| Parametros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repositorio en safetensors; no se declaran GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | en (inglés) |
| Licencia | afl-3.0 (Academic Free License 3.0) |
| Formato de pesos | safetensors (librería transformers, PyTorch) |

## Arquitectura y entrenamiento

El modelo fusiona un backbone transformer congelado (`Qwen2ForCausalLM`, base Qwen2.5-0.5B) con módulos simbólicos que operan sobre los estados ocultos. Según la model card, la arquitectura incluye: DTE-HDM (Dynamic Thought Evolution with Helical Encoding and DNA-Inspired Memory), que codifica contexto de forma espiral y mantiene memoria de largo plazo; M.A.S.R.M (Multi-Agent Symbiotic Response Mechanisms), que coordina agentes simbólicos y neuronales mediante atención con compuertas y capas de respuesta adaptativa; QwenExoCortex, que proyecta los estados ocultos del modelo Qwen a un espacio de fusión simbólica; y procesadores simbólicos como ThoughtDynamicsLNN, procesadores líquidos/cristalinos, razonamiento sobre grafos con DNAConv y una ThoughtMemory rotatoria. La model card menciona además el Analytic Foundations Theorem (AFT) como base teórica declarada, sin que se aporten detalles formales verificables en la información disponible.

El entrenamiento se realizó sobre 25.000 ejemplos de MetaMathQA (y se referencia también OpenThoughts2-1M en los metadatos), con los siguientes hiperparámetros: learning rate 3e-5, batch size total 1024 (16 × 64 pasos de acumulación de gradiente), optimizador AdamW (betas 0,9/0,999, epsilon 1e-8), scheduler coseno con 500 pasos de warmup, 3 épocas y precisión mixta con Native AMP. No se aplicó RLHF ni DPO según la model card. Las versiones de framework declaradas son Transformers 4.51.3, PyTorch 2.7.0+cu126, Datasets 3.5.0 y Tokenizers 0.21.1.

## Capacidades

- Generación de texto en inglés con énfasis en estructura lógica y razonamiento simbólico.
- Razonamiento matemático y generación de pruebas, con ajuste específico sobre MetaMathQA (Q&A simbólico, lógica de ecuaciones, inferencia estructurada).
- Memoria de largo plazo simulada mediante ThoughtMemory y codificación helicoidal (DTE-HDM), orientada a continuidad de "pensamiento" entre tokens.
- Coordinación multiagente interna (M.A.S.R.M) con atención con compuertas y capas de respuesta adaptativa.
- Razonamiento sobre grafos mediante DNAConv.
- Procesadores dinámicos tipo Liquid/Crystalline para adaptación contextual.
- No se declara soporte de tool calling ni function calling en la información disponible.
- No se declara soporte de visión, audio ni modo thinking explícito.
- Capacidad multilingüe limitada al inglés según los metadatos.

## Casos de uso

- Investigación en IA neuro-simbólica: el modelo sirve como banco de pruebas para estudiar la interacción entre atención modulada, replay de memoria y proyecciones simbólicas sobre un backbone congelado, gracias a los módulos QwenExoCortex y ThoughtMemory.
- Experimentos de memoria contextual de largo plazo: ThoughtMemory y DTE-HDM permiten probar mecanismos de persistencia de "pensamiento" entre tokens en tareas de razonamiento encadenado, aunque sin garantías de contexto extendido declarado.
- Generación de Q&A matemático estructurado: al estar afinado sobre MetaMathQA, es adecuado para prototipos de resolución de ecuaciones y problemas simbólicos en inglés, siempre con verificación posterior.
- Estudio de arquitecturas multiagente internas: M.A.S.R.M facilita experimentos sobre coordinación de agentes simbólicos y neuronales con feedback con compuertas.
- Base para adaptación de bajo recurso: el diseño modular de memoria y proyección está pensado, según el autor, para obtener resultados con datasets pequeños; útil para prototipos académicos con presupuesto limitado.
- Evaluación de técnicas de razonamiento sobre grafos: DNAConv permite experimentar con representaciones relacionales en tareas de lógica simbólica.
- Docencia y divulgación: como ejemplo didáctico de fusión neuro-simbólica sobre un modelo pequeño (base 0,5B), resulta útil en cursos de arquitecturas híbridas.

## Benchmarks y rendimiento

El model-index declarado por el autor define la entrada "SymLM" pero no incluye resultados (`results: []`). Por tanto:

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 7,1 GB solo para pesos (3,57B parámetros × 2 bytes), más overhead de activaciones y módulos simbólicos; en la práctica, reservar 10-12 GB.
- En cuantización de 8 bits: en torno a 3,6 GB de pesos; en 4 bits: en torno a 1,8 GB, aunque no se publican versiones GGUF ni cuantizadas oficiales.
- GPU recomendadas: A100 40 GB, H100 o L40S para experimentación cómoda con el modelo completo y batches grandes; RTX 4090 (24 GB) o RTX 3090 (24 GB) suficientes para inferencia en fp16.
- GPU de consumo: cabe en RTX 4090, RTX 3090, RTX 4080 (16 GB) y, con cuantización, en GPUs de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB).
- Opciones de despliegue: transformers (librería declarada); vLLM, TGI, llama.cpp u Ollama no están confirmados para esta arquitectura híbrida con módulos personalizados, por lo que su compatibilidad es no disponible.
- Latencia y throughput: no disponibles; al tratarse de un modelo de 3,57B con módulos adicionales, se espera mayor coste por token que un transformer puro de tamaño similar, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Symbiotic-Beta (SymLM) | 3,57B (base 0,5B + módulos) | no disponible | AFL-3.0 | Hugging Face, safetensors | Híbrido neuro-simbólico experimental; sin benchmarks publicados |
| Qwen2.5-0.5B (base) | 0,49B | 32.768 tokens | Apache 2.0 | Hugging Face, amplia variedad de formatos | Transformer estándar, bien documentado y con ecosistema de cuantizaciones |
| Qwen2.5-1.5B | 1,54B | 32.768 tokens | Apache 2.0 | Hugging Face | Alternativa estándar de tamaño similar en orden de magnitud, sin módulos simbólicos |
| Modelos matemáticos pequeños (p. ej. variantes afinadas de Qwen2.5 sobre MetaMathQA) | 0,5B-3B | 32.768 tokens (típico) | según base | Hugging Face | Enfoque puramente neural, sin fusión simbólica declarada |

La comparación directa con alternativas es difícil porque no hay benchmarks publicados para Symbiotic-Beta y su arquitectura no es estándar. Frente a Qwen2.5-0.5B, el modelo añade módulos que multiplican el número de parámetros (de ~0,49B a ~3,57B) sin que se documente la ganancia de rendimiento asociada.

## Limitaciones y advertencias

- Escala de entrenamiento limitada: solo 25.000 ejemplos de MetaMathQA según la model card; generalización amplia no garantizada.
- Sin RLHF ni alineamiento: las salidas no están ajustadas para seguridad ni para seguir instrucciones, y pueden alucinar.
- Fluidez no implica corrección: la fluidez simbólica no garantiza pruebas matemáticamente válidas; se recomienda verificación externa.
- No optimizado para generación abierta: prioriza lógica y estructura sobre profundidad conversacional.
- Solo inglés declarado; sin soporte multilingüe confirmado.
- Longitud de contexto no documentada: no se puede asumir la ventana de 32.768 tokens del modelo base tras la fusión simbólica.
- Arquitectura no estándar: la integración con servidores de inferencia habituales (vLLM, TGI, llama.cpp) no está confirmada y puede requerir código personalizado.
- Licencia AFL-3.0: permite uso comercial con condiciones de reciprocidad y atribución; conviene revisar los términos antes de integrar en producto.
- Estado experimental declarado por el propio autor; no apto para producción sin evaluación propia.
- Repositorio grande (35,9 GB) en relación con el número de parámetros, lo que sugiere artefactos adicionales o pesos redundantes; conviene inspeccionar antes de descargar.
- Riesgo de sesgos heredados del backbone Qwen2.5 y de los datasets de matemáticas utilizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/Symbiotic-Beta
- Perfil del autor: https://huggingface.co/reaperdoesntknow
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Dataset MetaMathQA: https://huggingface.co/datasets/meta-math/MetaMathQA
- Dataset OpenThoughts2-1M: https://huggingface.co/datasets/open-thoughts/OpenThoughts2-1M
- Modelos relacionados del autor: https://huggingface.co/reaperdoesntknow/Symbiotic-1B, https://huggingface.co/reaperdoesntknow/Symbiotic-8B, https://huggingface.co/reaperdoesntknow/Symiotic-14B
