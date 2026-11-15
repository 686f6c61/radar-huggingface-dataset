# DuoNeural/RMSN-SFT-CDI-d1024-L19

## Resumen

RMSN-SFT-CDI-d1024-L19 es un checkpoint de ajuste fino supervisado (SFT) de la familia RMSN (Resonant Metriplectic Sheaf Network), desarrollado por DuoNeural Lab y publicado en noviembre de 2026. Se trata de un modelo de lenguaje de aproximadamente 261,9 millones de parametros con una dimension oculta de 1024 y 19 capas, disenado en torno a una arquitectura no convencional que combina geometria de Clifford Cl_{3,0}, representacion mediante haces (sheaves) y un espacio de trabajo cuasiperiodico de tipo Aubry-Andre con 64 slots.

El modelo parte de un preentrenamiento con curriculo TATS y ha sido posteriormente ajustado con trazas de razonamiento de alta dificultad (CDM hard reasoning traces). Su interes tecnico radica en la hipotesis que el autor plantea: el gradiente del SFT puede reestructurar la topologia interna del modelo hasta el punto de generar una configuracion (Distributed Anchor) mejor que la observada en el checkpoint de preentrenamiento (Cemented-Deep-Internal-CDI).

Es relevante ahora como objeto de estudio para investigadores interesados en arquitecturas alternativas al transformer estandar, en optimizadores no convencionales (Muon combinado con AdamW) y en el analisis de como el ajuste fino altera la geometria interna del modelo. No obstante, los resultados de evaluacion publicados muestran un empeoramiento notable en perplejidad de lenguaje general (WikiText-103) tras el SFT, lo que sugiere una especializacion muy agresiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RMSN (Resonant Metriplectic Sheaf Network), geometria de Clifford Cl_{3,0} con haces fibrados y espacio de trabajo cuasiperiodico Aubry-Andre |
| Parametros totales | ~261,9M (211,5M optimizados con Muon + 50,4M con AdamW) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | PyTorch (.pt, `rmsn_sft_best.pt`) con `model_state`; requiere `rmsn_core.py` para instanciar el modelo |

Otros datos tecnicos: vocabulario de 49.152 tokens (tokenizer cosmo2, HuggingFaceTB/cosmo2-tokenizer), 64 slots de workspace, checkpoint de ~0,9 GB.

## Arquitectura y entrenamiento

La arquitectura RMSN se aleja del transformer convencional. Segun la model card, emplea haces fibrados de Clifford Cl_{3,0} con un escaneo delta modulado por espinores, un espacio de trabajo cuasiperiodico de tipo Aubry-Andre con 64 slots y una representacion basada en teoria de haces (sheaf-theoretic fiber bundle). El entrenamiento se organizo en dos fases: un preentrenamiento con curriculo TATS y un posterior ajuste fino supervisado sobre trazas de razonamiento CDM de alta dificultad.

El modelo utiliza un esquema de optimizacion hibrido: los parametros denominados metriplecticos (211,5M) se entrenan con el optimizador Muon, mientras que el resto (50,4M) usa AdamW. El autor reporta un hallazgo central (denominado "Law" en la model card): el gradiente del SFT reestructuro la topologia del checkpoint de preentrenamiento, pasando de una configuracion Cemented-Deep-Internal-CDI a una configuracion Distributed Anchor, y sostiene que el "cemento" M_eff=4 es suficientemente entrenable como para permitir una reestructuracion topologica completa. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto en ingles.
- Razonamiento de cadena de pensamiento (CoT) de alta dificultad, segun los datos de evaluacion en CDM CoT Hard.
- Razonamiento especializado tras SFT sobre trazas CDM.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion en arquitecturas alternativas: el modelo sirve como banco de pruebas para estudiar redes basadas en haces y geometria de Clifford frente a transformers convencionales, dado que su codigo de definicion (`rmsn_core.py`) es necesario para instanciarlo.
- Estudio de dinamica del ajuste fino: permite analizar experimentalmente como el gradiente del SFT modifica la topologia interna de una red, comparando los checkpoints de preentrenamiento y SFT.
- Experimentos con el optimizador Muon: al separar explicitamente los parametros optimizados con Muon (211,5M) y AdamW (50,4M), es util para replicar o contrastar resultados de entrenamiento con ambos optimizadores.
- Razonamiento de cadena de pensamiento controlado: con una perplejidad de 15,21 en CDM CoT Hard, puede emplearse en entornos de investigacion para generar trazas de razonamiento estructurado en ingles.
- Reproduccion de resultados academicos: al estar bajo licencia Apache 2.0 y publicarse los pesos, permite replicar las metricas reportadas (WikiText-103 y CDM CoT Hard) en laboratorios con recursos limitados.
- Docencia y divulgacion: su tamano (~262M parametros) y su caracter experimental lo hacen adecuado para explicar conceptos de geometria de Clifford, teoria de haces y optimizadores no estandar en cursos avanzados de aprendizaje profundo.

## Benchmarks y rendimiento

| Metrica | Base (preentrenamiento) | SFT |
|---|---|---|
| WikiText-103 PPL | 72,50 | 139,47 |
| CDM CoT Hard PPL | 5795 | 15,21 |

El autor indica que, en la clasificacion de CoT, este checkpoint ocupa el puesto numero 2 de todas las variantes RMSN con D=1024. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con ~261,9M parametros, en precision completa (fp32) el modelo ocuparia aproximadamente 1 GB de pesos, y en fp16/bf16 alrededor de 0,5 GB, mas el coste de activaciones y del espacio de trabajo de 64 slots.
- GPU recomendadas: no disponible en la informacion proporcionada; por tamano, cabria en GPUs de consumo como RTX 3060, RTX 4060 o superiores, aunque no se confirma compatibilidad.
- Cabe en GPU de consumo: probablemente si, dado el tamano, pero no confirmado por el autor.
- Opciones de despliegue: requiere cargar el checkpoint mediante `rmsn_core.py` (clase `ResonantMetriplecticSheafLM` y `RMSNConfig`) con PyTorch; no se menciona soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (arquitecturas RMSN o de geometria de Clifford) ni datos de rendimiento de alternativas con los que contrastar parametros, contexto o licencia.

## Limitaciones y advertencias

- El SFT degrada gravemente el rendimiento en lenguaje general: la perplejidad en WikiText-103 pasa de 72,50 a 139,47, lo que indica una perdida sustancial de calidad en texto generico.
- La perplejidad en CDM CoT Hard del checkpoint base era de 5795, un valor muy alto que sugiere que el preentrenamiento no estaba orientado a ese dominio; la mejora tras SFT (15,21) es muy especifica.
- Solo soporta ingles segun la etiqueta de idioma; no hay evidencia de capacidades multilingues.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion ni evaluaciones de seguridad.
- La longitud de contexto no esta documentada, lo que impide planificar su uso en tareas de contexto largo.
- Requiere codigo externo (`rmsn_core.py`) para cargar el modelo, lo que anade friccion y riesgo de incompatibilidad en produccion.
- Es un checkpoint de investigacion con cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso en produccion ni validacion independiente.
- La model card indica "paper forthcoming"; no hay publicacion revisada por pares que respalde las afirmaciones sobre topologia y la "Law" descrita.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte.

## Enlaces

- Hugging Face: https://huggingface.co/DuoNeural/RMSN-SFT-CDI-d1024-L19
- Tokenizer cosmo2: https://huggingface.co/HuggingFaceTB/cosmo2-tokenizer
- Contacto del autor: archon@agentmail.to
- Paper, blog, repositorio o demo: no disponible en la informacion proporcionada.
