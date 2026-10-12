# seomh/opd-sftm4dm15e-s500-qwen3moe30b-ot3math-step20

## Resumen

Este repositorio contiene un checkpoint de ajuste supervisado (SFT) de la familia Qwen3, publicado por el usuario seomh bajo el identificador `opd-sftm4dm15e-s500-qwen3moe30b-ot3math-step20`. Por la nomenclatura se trata de un punto de control intermedio (paso 20 de un entrenamiento de 500 pasos, segun el sufijo `s500` y `step20`) especializado en razonamiento matematico, entrenado sobre el conjunto de datos OpenThoughts3 Math (`ot3math`). El modelo esta pensado para reproducir trazas de razonamiento detalladas que terminan en una respuesta enmarcada (formato `boxed`), un patron habitual en modelos de matematicas de la familia Qwen3.

El dato real de pesos en safetensors indica 4.022.468.096 parametros (~4B) con precision BF16, aunque el nombre del repositorio hace referencia a "qwen3moe30b", lo que apunta a una posible discrepancia entre el nombre y los pesos efectivamente almacenados. El tamano del repositorio es de 8,1 GB, coherente con ~4B parametros en BF16. No hay model card, ni licencia declarada, ni idiomas especificados, y el modelo acumula un numero muy bajo de descargas (10) y cero "likes", lo que lo situa como un experimento de investigacion mas que como un artefacto listo para produccion.

Es relevante ahora porque forma parte de una serie de checkpoints publicos que exploran el ajuste fino de modelos Qwen3 (incluidas variantes MoE) sobre datos de matematicas con trazas de razonamiento, un area activa para la generacion de datos sinteticos y la evaluacion de pipelines de razonamiento paso a paso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (nombre del repo sugiere variante MoE de Qwen3; no confirmado en la informacion disponible) |
| Parametros totales | 4.022.468.096 (~4B) segun safetensors; discrepancia con el nombre "qwen3moe30b" |
| Parametros activos | no disponible (si es MoE, no se especifica el numero de expertos ni activos) |
| Longitud de contexto | no disponible para este checkpoint (la familia Qwen3 usa 32.768 tokens nativos, ampliables con YaRN; no confirmado aqui) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16; no se listan GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (tensor type BF16) |

## Arquitectura y entrenamiento

No se ha publicado informacion detallada sobre la arquitectura especifica en la model card, que esta ausente. El nombre del repositorio (`qwen3moe30b`) sugiere que el modelo base pertenece a la familia Qwen3 con arquitectura Mixture-of-Experts (MoE), pero el recuento real de parametros en safetensors (~4B) no coincide con el tamano tipico de una variante MoE de 30B, por lo que conviene tratar la descripcion arquitectonica con cautela. Los pesos estan almacenados en BF16 y el repositorio incluye una plantilla de chat (`Chat template`).

En cuanto al entrenamiento, el sufijo `ot3math` indica que el ajuste se realizo sobre OpenThoughts3 Math, un conjunto de datos de razonamiento matematico con trazas de pensamiento detalladas que finalizan en respuestas enmarcadas. Los sufijos `s500` y `step20` apuntan a un entrenamiento de 500 pasos del que este repositorio recoge el checkpoint del paso 20, es decir, un punto intermedio y probablemente no convergido. Repositorios hermanos del mismo autor (por ejemplo, `opd-sftb8dm15e-lr2e-5-s500-qwen3moe30b-ot3math-step20` y `opd-sftk8dm15e-lr5e-5-s500-qwen3moe30b-ot3math-step10`) emplean tasas de aprendizaje como 2e-5 y 5e-5, lo que sugiere una busqueda de hiperparametros. No hay informacion disponible sobre si se aplico RLHF, DPO u otras tecnicas de alineamiento posteriores.

## Capacidades

- Generacion de texto y razonamiento matematico paso a paso, con trazas de pensamiento orientadas a desembocar en una respuesta enmarcada.
- Resolucion de problemas matematicos del estilo de los presentes en OpenThoughts3 Math.
- Reproduccion de cadenas de razonamiento largas (estilo "chain-of-thought"), segun el formato del dataset de entrenamiento.
- Soporte de plantilla de chat (ChatML u homologa), segun los ficheros del repositorio.
- Capacidades multilingues: no disponibles (no se declaran idiomas).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita, aunque el formato de trazas de razonamiento es compatible con pipelines multi-paso.
- Otras capacidades (vision, audio, modo "thinking" explicito): no disponibles.

## Casos de uso

- Generacion de datos sinteticos de matematicas: el modelo puede producir soluciones con trazas de razonamiento detalladas y respuestas enmarcadas, utiles para ampliar datasets de entrenamiento o evaluacion en dominios matematicos.
- Investigacion en razonamiento paso a paso: sirve como checkpoint de referencia para estudiar como evoluciona la calidad del razonamiento a lo largo del entrenamiento (al ser el paso 20 de una serie de 500).
- Evaluacion comparativa de hiperparametros: al existir checkpoints hermanos con distintas tasas de aprendizaje y pasos, permite comparar estrategias de SFT sobre el mismo dataset.
- Tutorizacion matematica experimental: puede emplearse para generar explicaciones paso a paso en entornos educativos, siempre que se validen las respuestas por su riesgo de error.
- Verificacion asistida de soluciones: dado un problema y una respuesta candidata, el modelo puede generar una traza alternativa para contrastar el resultado.
- Prototipado rapido en investigacion: su tamano de ~4B en BF16 permite desplegarlo en hardware modesto para experimentos de razonamiento sin infraestructura de gran escala.
- Filtrado de datos: puede usarse para reescribir o normalizar problemas y soluciones matematicas en formato de traza y respuesta enmarcada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada (inferencia): aproximadamente 8 GB de pesos en BF16 para ~4B parametros, mas espacio para cache KV y activaciones.
- GPU recomendadas: una RTX 3090 o RTX 4090 (24 GB) permite cargar el modelo completo en BF16 con margen; una A100 o H100 ofrece holgura adicional y mayor throughput.
- Consumer GPU: cabe en GPUs de consumo con 12 GB o mas (por ejemplo, RTX 3060 12 GB, RTX 4060 Ti 16 GB) en BF16; con cuantizacion a 8 bits o 4 bits cabria en GPUs de 8 GB o menos (cuantizaciones no publicadas para este checkpoint).
- Opciones de despliegue: al ser pesos safetensors en BF16, son compatibles con vLLM, TGI y transformers; para llama.cpp u Ollama seria necesario convertir a GGUF, conversion no publicada.
- Latencia y throughput estimados: no disponibles (no se aportan mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| opd-sftm4dm15e-s500-qwen3moe30b-ot3math-step20 (este) | ~4B (safetensors) | no disponible | Matematicas (OpenThoughts3 Math), SFT paso 20 | no disponible | HuggingFace, 10 descargas |
| opd-sftb8dm15e-lr2e-5-s500-qwen3moe30b-ot3math-step20 | 8B (segun model card) | no disponible | Matematicas (OpenThoughts3 Math), SFT paso 20 | no disponible | HuggingFace |
| opd-sftk8dm15e-lr5e-5-s500-qwen3moe30b-ot3math-step10 | 8B (segun model card) | no disponible | Matematicas (OpenThoughts3 Math), SFT paso 10 | no disponible | HuggingFace |
| seomh/Qwen3-8B-Base-OpenThoughts3Math-SFT-step750-lr5e-6 | 8B | no disponible | Matematicas (OpenThoughts3 Math), SFT paso 750 | no disponible | HuggingFace / Featherless |

Nota: los tamanos declarados en las model cards de los repositorios hermanos (8B) entran en conflicto con el recuento real de safetensors de este repositorio (~4B); la comparacion debe tomarse con cautela.

## Limitaciones y advertencias

- Al ser un checkpoint intermedio (paso 20 de 500), es probable que el modelo no haya convergido y que su calidad de razonamiento sea inferior a la de un entrenamiento completo.
- Ausencia total de model card: no se documentan datos de entrenamiento completos, hiperparametros exactos, composicion del dataset ni evaluacion.
- Licencia no declarada: no se puede garantizar el uso comercial ni la redistribucion; es necesario contactar con el autor.
- Riesgo de alucinacion elevado en tareas matematicas, especialmente en un checkpoint no finalizado; las respuestas deben verificarse.
- Idiomas no especificados: se desconoce el grado de soporte multilingue real.
- Tamano declarado en el nombre ("qwen3moe30b") incoherente con el recuento real de parametros (~4B), lo que dificulta estimar requisitos y rendimiento.
- Nulo soporte declarado de tool calling, agentes o modalidades adicionales.
- Traccion muy baja (10 descargas, 0 likes) y sin despliegue en proveedores de inferencia, lo que reduce la evidencia comunitaria sobre su comportamiento.

## Enlaces

- Repositorio principal en HuggingFace: https://huggingface.co/seomh/opd-sftm4dm15e-s500-qwen3moe30b-ot3math-step20
- Repositorio hermano (lr2e-5, step20): https://huggingface.co/seomh/opd-sftb8dm15e-lr2e-5-s500-qwen3moe30b-ot3math-step20
- Repositorio hermano (lr5e-5, step10): https://huggingface.co/seomh/opd-sftk8dm15e-lr5e-5-s500-qwen3moe30b-ot3math-step10
- Fine-tune relacionado (Qwen3-8B-Base, OpenThoughts3 Math, step750): https://featherless.ai/models/seomh/Qwen3-8B-Base-OpenThoughts3Math-SFT-step750-lr5e-6
- Resena de la familia Qwen3 (dense y MoE, modos thinking/no-thinking): https://www.everydev.ai/tools/qwen3
- Calendario de lanzamientos de modelos de IA (contexto de la familia Qwen3): https://www.scriptbyai.com/ai-model-release-calendar/
