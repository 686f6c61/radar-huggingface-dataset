# DuoNeural/RMSN-193M-Shallow-Soliton

## Resumen

RMSN-193M-Shallow-Soliton es un modelo de lenguaje de 243,7 millones de parámetros (etiquetado comercialmente como "193M") desarrollado por DuoNeural AI Laboratory, un laboratorio independiente de investigación en IA. Se presenta como una implementación de la arquitectura RMSN (Resonant Metriplectic Sheaf Network), una propuesta de red neuronal para secuencias de tipo Port-Hamiltoniano en la que la estabilidad de Lyapunov se trata como un invariante estructural del operador de avance y no como un regularizador añadido. El modelo se publica bajo licencia MIT y está orientado a generación de texto en inglés.

El modelo se entrena sobre WikiText-103 durante 100.000 pasos (204,8 millones de tokens) con un tokenizador propio de vocabulario 49.152 ("cosmo2") y una longitud de contexto de 512 tokens. La model card reporta una perplejidad de validación de 70,3 y un exponente de Lyapunov máximo de -2,1255, que el autor interpreta como evidencia de un régimen disipativo ("shallow soliton"). La relevancia del modelo es fundamentalmente experimental: explora una familia arquitectónica alternativa a los transformers estándar y publica métricas de estabilidad dinámica poco habituales en modelos de lenguaje.

No se trata de un modelo competitivo en calidad de generación frente a transformers convencionales de tamaño similar; su interés es de investigación en dinámica de sistemas, interpretabilidad mecanicista y estabilidad de atractores en redes recurrentes o jerárquicas. La información pública disponible es escasa y proviene casi exclusivamente de la model card y del repositorio del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RMSN (Resonant Metriplectic Sheaf Network), formulación Port-Hamiltoniana con estructura metripléctica |
| Parametros totales | 243.732.144 (según safetensors); la model card indica ~193M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (PyTorch) |
| Vocabulario | 49.152 (tokenizador "cosmo2") |
| Dimensiones internas | dim 1024 / depth 16 / slots 64 |
| Datos de entrenamiento | WikiText-103, 100.000 pasos, 204,8M tokens |
| Perplejidad de validación | 70,3 |
| Exponente de Lyapunov máximo | -2,1255 |

## Arquitectura y entrenamiento

La arquitectura RMSN se describe mediante la ecuación de evolución $\dot{f} = \{f, H\} + [f, S]$, es decir, una componente hamiltoniana (corchete de Poisson) más una componente disipativa (corchete de metriplecticidad). El autor sostiene que la estabilidad de Lyapunov es una propiedad estructural del operador hacia delante, no un término de regularización. La configuración concreta es dim=1024, profundidad=16 y 64 slots, con un tokenizador propio de 49.152 entradas y contexto de 512 tokens. La model card menciona además conceptos de teoría de haces (sheaf theory) y sectores de Casimir topológicos, sin detallar la implementación operativa.

El entrenamiento se realizó sobre WikiText-103 durante 100.000 pasos (204,8M tokens). No se documentan fases de RLHF, DPO ni SFT en este checkpoint. El autor reporta un ciclo de "profundización" del atractor con exponentes de Lyapunov por tramos: W1=-1,033 en el paso 46K, W2=-1,221 en el paso 65K, W3=-2,018 en el paso 70,9K y W4=-2,163 en el paso 90,5K. También afirma que la probabilidad de régimen "solitón" es del 20% (2 de 10 semillas) en la arquitectura de 193M. No se especifican detalles sobre el hardware de entrenamiento, la composición exacta del dataset más allá de WikiText-103 ni innovaciones de decodificación.

## Capacidades

- Generación de texto autorregresiva en inglés con contexto de 512 tokens.
- Modelado de lenguaje de propósito general limitado al dominio y tamaño de WikiText-103.
- Estabilidad dinámica estructural: el operador de avance preserva condiciones de Lyapunov por diseño, según el autor.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso en este checkpoint (existe un modelo derivado, RMSN-193M-Soliton-Reasoning-SFT, con SFT sobre trazas de razonamiento).
- No se documenta capacidad multilingüe: solo inglés.
- No se documentan capacidades de visión, audio ni modo "thinking".
- Tokenizador propio ("cosmo2") con vocabulario de 49.152 entradas, lo que requiere usar la configuración del autor y no tokenizadores estándar.

## Casos de uso

- Investigación en arquitecturas alternativas a transformers: el modelo sirve como banco de pruebas para estudiar dinámicas hamiltonianas y metriplécticas en modelado de lenguaje, comparando perplejidad y estabilidad frente a baselines transformer del mismo tamaño.
- Experimentos de interpretabilidad mecanicista: los "slots" (64) y la formulación con haces permiten analizar cómo se organiza la información en componentes estructurales separados y si emergen representaciones interpretables.
- Estudio de estabilidad de atractores: el exponente de Lyapunov negativo reportado permite investigar la relación entre estabilidad dinámica y calidad de generación en modelos pequeños.
- Generación de texto de baja latencia en entornos con recursos limitados: con 243,7M parámetros y contexto de 512, cabe en GPUs de consumo y puede ejecutarse en CPU para prototipos.
- Reproducción de experimentos académicos: al estar bajo licencia MIT y publicar pesos safetensors, es apto para replicar resultados de la model card (perplejidad 70,3 en WikiText-103) y validar las afirmaciones del autor.
- Base para fine-tuning controlado: el checkpoint puede servir como punto de partida para SFT en dominios acotados en inglés, como ya hizo el autor con la variante Reasoning-SFT.
- Docencia y divulgación: ejemplo práctico de arquitecturas physics-informed aplicadas a NLP en cursos de machine learning avanzado.

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| Perplejidad de validación (WikiText-103) | 70,3 | Reportado en la model card |
| Exponente de Lyapunov máximo | -2,1255 | Régimen disipativo ("shallow soliton") |
| Tokens de entrenamiento | 204,8M | 100.000 pasos sobre WikiText-103 |
| Probabilidad de régimen solitón | 20% (2/10 semillas) | Según el autor, en arquitectura de 193M |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, HellaSwag) en la información disponible. No se dispone de comparaciones numéricas con modelos de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1 GB para los 243,7M parámetros, más overhead de activaciones y KV cache (contexto 512, dim 1024, 16 capas).
- VRAM estimada en fp16/bf16: en torno a 0,5 GB de pesos, más overhead; cabe holgadamente en cualquier GPU de consumo con 4 GB o más.
- GPU recomendadas: RTX 3060/4060, RTX 4090, A100 o H100 para experimentos por lotes; el modelo es pequeño y no requiere GPU de datacenter.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna con al menos 4 GB de VRAM; también es viable en CPU para inferencia puntual.
- Opciones de despliegue: al publicarse solo en safetensors con tokenizador propio, la vía natural es PyTorch con `transformers` o código del repositorio del autor; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y la ausencia de pesos GGUF limita el despliegue en esos ecosistemas.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| RMSN-193M-Shallow-Soliton | 243,7M | 512 | MIT | safetensors | Arquitectura physics-informed; perplejidad 70,3 en WikiText-103; sin benchmarks estándar |
| GPT-2 small (referencia) | 124M | 1024 | MIT | safetensors, GGUF | Transformer estándar; ampliamente soportado en todos los runtimes |
| GPT-2 medium (referencia) | 355M | 1024 | MIT | safetensors, GGUF | Transformer estándar; mayor tamaño y ecosistema maduro |
| Pythia-160M (referencia) | 160M | 2048 | Apache 2.0 | safetensors | Suite de investigación con checkpoints intermedios y benchmarks publicados |

No se dispone de datos de rendimiento comparativo del RMSN frente a estos modelos en la información proporcionada; la comparación se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo de investigación con validación limitada: solo se reporta perplejidad en WikiText-103; no hay evaluación en tareas downstream ni benchmarks estándar.
- Contexto muy corto (512 tokens), insuficiente para la mayoría de aplicaciones de producción con documentos largos o conversaciones multi-turno extensas.
- Solo inglés; no se documenta soporte multilingüe.
- Tokenizador propio ("cosmo2") no estándar: requiere configuración específica y puede complicar la integración con pipelines existentes.
- Riesgo de alucinación no cuantificado; con perplejidad 70,3 en WikiText-103, la calidad de generación es limitada incluso en su dominio de entrenamiento.
- Sin cuantizaciones publicadas (GGUF, AWQ, GPTQ), lo que restringe el despliegue en llama.cpp, Ollama y similares.
- Las afirmaciones sobre estabilidad de Lyapunov, sectores de Casimir y "solitones" provienen del propio autor y no han sido verificadas de forma independiente en la información disponible.
- Sin datos sobre sesgos; al entrenarse solo con WikiText-103, es probable que herede sesgos del corpus (Wikipedia en inglés), pero no se han publicado análisis.
- Licencia MIT permite uso comercial, pero la madurez del modelo y la falta de evaluación hacen desaconsejable su uso en producción sin validación previa.
- El número de parámetros de la model card (~193M) no coincide con el recuento real de safetensors (243,7M); conviene verificar la configuración antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DuoNeural/RMSN-193M-Shallow-Soliton
- Variante con SFT de razonamiento: https://huggingface.co/DuoNeural/RMSN-193M-Soliton-Reasoning-SFT
- Repositorio GitHub: https://github.com/DuoNeural/RMSN
- Organización en Hugging Face: https://huggingface.co/DuoNeural
- Sitio web del laboratorio: https://duoneural.com/
- Licencia MIT: https://opensource.org/licenses/MIT
