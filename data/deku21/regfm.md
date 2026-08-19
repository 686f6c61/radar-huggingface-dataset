# Deku21/RegFM

## Resumen

RegFM es un modelo de fundación (foundation model) para la regulación transcripcional humana, desarrollado por Zijing Gao y colaboradores (contacto en Tsinghua University) y publicado bajo licencia MIT. El modelo trata la regulación génica como un diálogo entre secuencias cis-reguladoras (CREs) y reguladores trans (factores de transcripción y reguladores de cromatina), acoplando representaciones de CRE de largo alcance con la actividad de TF/CR. Está entrenado con perfiles transcriptómicos a gran escala de ENCODE y CELLxGENE, y aprende representaciones regulatorias centradas en genes que generalizan a contextos celulares no vistos.

La arquitectura concreta (número de parámetros, tipo de red, etc.) no se detalla en la información disponible, pero el repositorio de HuggingFace ocupa 18,8 GB, lo que sugiere un modelo de tamaño considerable. Está implementado en PyTorch y su pipeline se clasifica como "other" (no es un modelo de lenguaje estándar). Su relevancia radica en que aborda un problema central en genómica: predecir la expresión génica a partir de secuencia y contexto celular, con aplicaciones en anotación de elementos reguladores, respuesta a perturbaciones y análisis interpretable de interacciones cis-trans.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (framework PyTorch) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | no disponible (repo de 18,8 GB, probablemente safetensors o binarios PyTorch) |

## Arquitectura y entrenamiento

La model card describe RegFM como un modelo "consciente del contexto" que modela la regulación transcripcional como un diálogo entre secuencias cis-reguladoras (CREs) y reguladores trans (factores de transcripción y reguladores de cromatina). Esto implica una arquitectura que combina representaciones de secuencia de ADN de largo alcance (posiblemente mediante redes convolucionales o transformers) con señales de actividad de TF/CR específicas del contexto celular. El modelo se entrena con perfiles transcriptómicos de ENCODE y CELLxGENE, dos recursos masivos de datos genómicos y de expresión génica. No se especifican detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si se utilizaron técnicas como RLHF o DPO. La innovación principal declarada es el acoplamiento de representaciones de CRE de largo alcance con la actividad de reguladores trans, lo que permite generalizar a contextos celulares no vistos.

## Capacidades

- Predicción de expresión génica en contextos celulares no vistos (por ejemplo, tipos celulares no incluidos en el entrenamiento).
- Anotación de elementos cis-reguladores (CREs) a partir de secuencia y contexto.
- Análisis de promotores bivalentes y de sensibilidad a dosis génica.
- Predicción de respuesta a perturbaciones (por ejemplo, knockout o sobreexpresión de factores de transcripción).
- Análisis interpretable de interacciones cis-trans regulatorias, permitiendo identificar qué secuencias y qué factores contribuyen a la regulación de un gen.
- Representaciones regulatorias centradas en genes que pueden usarse como características para tareas downstream.

## Casos de uso

- Predicción de expresión génica en tipos celulares raros o no caracterizados: dado un perfil de cromatina y actividad de TF/CR, RegFM puede estimar la expresión de genes en contextos donde no hay datos transcriptómicos directos, útil para estudios de diferenciación celular o desarrollo.
- Anotación de elementos cis-reguladores en genomas: el modelo puede identificar regiones reguladoras (promotores, enhancers) a partir de secuencia y contexto, facilitando la interpretación de variantes no codificantes asociadas a enfermedades.
- Análisis de promotores bivalentes: RegFM puede ayudar a identificar promotores que mantienen marcas tanto activas como represivas, relevantes en biología de células madre y cáncer.
- Predicción de respuesta a perturbaciones: al modelar la actividad de TF/CR, el modelo puede anticipar cómo cambios en la expresión de un factor de transcripción afectan a la expresión génica global, útil para diseño de experimentos CRISPR o terapias génicas.
- Interpretación de interacciones reguladoras: las representaciones aprendidas permiten descomponer qué elementos cis y qué factores trans contribuyen a la regulación de un gen concreto, apoyando la generación de hipótesis mecanísticas.
- Integración multi-ómica: las representaciones de RegFM pueden combinarse con datos de ATAC-seq, ChIP-seq o metilación para construir modelos predictivos de fenotipos celulares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona un demo de "leave-one-out" en PBMC (predecir CD8 TEM 1), pero no se proporcionan métricas numéricas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. El tamaño del repositorio (18,8 GB) sugiere que el modelo podría requerir al menos 20-40 GB de VRAM en precisión completa (fp32), y posiblemente 10-20 GB en cuantización de 8 bits, pero esto es una estimación no confirmada.
- GPU recomendadas: no hay especificaciones oficiales. Para inferencia en fp32, una GPU con 24 GB o más (RTX 3090/4090, A10G, A100) sería necesaria. Con cuantización, podría caber en GPUs de 16 GB.
- Si cabe en consumer GPU: probablemente sí con cuantización (por ejemplo, GGUF o int8), pero no hay confirmación.
- Opciones de despliegue: al ser un modelo PyTorch, puede servirse con vLLM, TGI o directamente con PyTorch. No se menciona soporte para llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en el ámbito de la regulación transcripcional humana. Existen otros modelos de genómica como Enformer, Basenji o scGPT, pero no se han encontrado comparaciones directas con RegFM en la información proporcionada. Se recomienda consultar la literatura reciente para establecer comparativas.

## Limitaciones y advertencias

- No se han documentado sesgos específicos, pero al entrenarse con datos de ENCODE y CELLxGENE, que provienen principalmente de líneas celulares y tejidos humanos comunes, el modelo puede tener un rendimiento inferior en contextos celulares poco representados (por ejemplo, tejidos raros o estados patológicos).
- Riesgo de alucinación: al ser un modelo de regresión/predicción, no genera texto, pero las predicciones de expresión génica pueden ser inexactas en contextos muy alejados del entrenamiento.
- Limitaciones de contexto: la longitud de contexto no está especificada; los elementos cis-reguladores de largo alcance pueden requerir ventanas de secuencia amplias, y no se sabe si el modelo las maneja adecuadamente.
- Restricciones de licencia: la licencia MIT permite uso comercial sin restricciones, pero el modelo es de investigación y no se garantiza su precisión para uso clínico o diagnóstico.
- Caveat para producción: no hay información sobre estabilidad numérica, versionado de pesos, ni soporte oficial. El modelo parece estar en fase de investigación (preprint bioRxiv 2026).

## Enlaces

- HuggingFace: https://huggingface.co/Deku21/RegFM
- GitHub (código y demo): https://github.com/ZjGaothu/RegFM
- Contacto: gzj21@mails.tsinghua.edu.cn
