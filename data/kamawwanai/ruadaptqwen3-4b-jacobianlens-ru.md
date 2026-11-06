# kamawwanai/RuadaptQwen3-4B-JacobianLens-RU

## Resumen

RuadaptQwen3-4B-JacobianLens-RU es un conjunto de checkpoints experimentales de tipo Jacobian Lens calibrados sobre el modelo base RefalMachine/RuadaptQwen3-4B-Instruct, una adaptación al ruso de la familia Qwen3 con 4.000 millones de parámetros. No se trata de un modelo generativo autónomo, sino de un artefacto de interpretabilidad mecanicista: permite proyectar activaciones internas del transformer en el espacio de tokens para intentar decodificar conceptos intermedios durante tareas de razonamiento multietapa en ruso. Lo publica el usuario kamawwanai bajo el identificador kamawwanai/RuadaptQwen3-4B-JacobianLens-RU.

El interés del proyecto radica en aplicar la técnica Jacobian Lens (implementación de Anthropic) a un modelo pequeño y especializado en ruso, un idioma con menos recursos de interpretabilidad que el inglés. El objetivo declarado es investigar si los conceptos intermedios ocultos pueden decodificarse a partir de las activaciones durante preguntas de dos saltos (two-hop QA) en ruso. El repositorio incluye tres checkpoints calibrados con 10, 25 y 50 textos sintéticos respectivamente.

El estado del proyecto es explícitamente experimental y la evaluación está en curso. El tamaño del repositorio es de 1,4 GB, la licencia no está declarada y el modelo no registra descargas ni interacciones en el momento de la consulta. No debe confundirse con un modelo listo para producción: es material de investigación para estudiar la estructura interna de un LLM en ruso.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Checkpoints de interpretabilidad (Jacobian Lens) sobre transformer Qwen3 adaptado al ruso |
| Parámetros totales | 4B (modelo base RuadaptQwen3-4B-Instruct) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (longitud de secuencia de calibración: 128 tokens) |
| Tipos de cuantización | no disponible (calibración en FP16) |
| Idiomas soportados | ruso (ru) |
| Licencia | no disponible |
| Formato de pesos | checkpoints PyTorch (.pt) |
| Librería | pytorch |
| Modelo base | RefalMachine/RuadaptQwen3-4B-Instruct (revisión 03bcd55e56b02175bcc863c4761613b1bda8302b) |
| Tamaño del repositorio | 1,4 GB |
| Capas origen | 0–34 |
| Capa destino | 35 |
| Hidden size | 2560 |
| Skip first | 16 tokens |
| Precisión de calibración | FP16 |
| Framework | PyTorch, Transformers, Jacobian Lens |

## Arquitectura y entrenamiento

El artefacto no entrena un modelo nuevo, sino que calibra una lente jacobiana sobre las activaciones de un transformer decoder de 4B parámetros (RuadaptQwen3-4B-Instruct). La técnica Jacobian Lens estima, mediante derivadas jacobianas entre capas, una proyección lineal que mapea estados ocultos intermedios (capas 0 a 34, con hidden size 2560) hacia el espacio de tokens de la capa final (capa 35). Esto permite inspeccionar qué tokens serían decodificables desde una representación intermedia concreta.

La calibración se realizó con el dataset sintético RU-MIXED-50, compuesto por textos en ruso, con secuencias de 128 tokens, omitiendo los primeros 16 tokens y en precisión FP16. Se generaron tres checkpoints según el número de textos de calibración: jlens_ruadapt_10.pt (10 textos), jlens_ruadapt_25.pt (25 textos) y jlens_ruadapt_50.pt (50 textos). No se documenta el número total de tokens de entrenamiento del modelo base, la composición completa de su dataset, ni si hubo RLHF o DPO en su alineamiento; esa información corresponde a la model card del modelo base y no se incluye en la información disponible.

## Capacidades

- Decodificación de conceptos intermedios: proyecta activaciones de capas 0–34 al espacio de tokens para inspeccionar representaciones ocultas.
- Análisis de razonamiento multietapa: diseñado para estudiar two-hop QA en ruso.
- Extracción de rankings de tokens: permite obtener los tokens más probables decodificables desde una capa intermedia.
- Compatibilidad con PyTorch y Transformers mediante la librería jlens.
- Tres niveles de calibración (10, 25 y 50 textos) para comparar estabilidad de la lente.
- No es un modelo generativo: no produce texto de forma autónoma, sino que analiza las activaciones del modelo base.
- Soporte multilingüe limitado al ruso en la calibración; no se documentan otras lenguas.
- No se documenta soporte de tool calling, function calling ni comportamiento agéntico, al no ser un modelo de chat.

## Casos de uso

- Investigación en interpretabilidad mecanicista: usar los checkpoints para estudiar cómo se representan conceptos intermedios en un LLM entrenado principalmente en ruso, comparando los tres niveles de calibración para evaluar la estabilidad de la lente.
- Análisis de two-hop QA en ruso: aplicar la lente a las activaciones del modelo base mientras responde preguntas que requieren dos saltos de razonamiento, para localizar en qué capas aparece la información del salto intermedio.
- Auditoría de sesgos y representaciones: inspeccionar qué tokens se activan en capas intermedias ante estímulos concretos, como apoyo a estudios de sesgo lingüístico en ruso.
- Docencia y divulgación: demostrar de forma práctica cómo funciona una lente jacobiana sobre un transformer de 4B parámetros con recursos de GPU modestos.
- Comparación de metodologías de interpretabilidad: contrastar Jacobian Lens con técnicas como logit lens o probing lineal sobre el mismo modelo base.
- Desarrollo de herramientas de depuración de modelos: integrar la lente en pipelines internos que analicen por qué un modelo en ruso produce ciertas respuestas, inspeccionando representaciones intermedias.
- Reproducibilidad de investigación: servir como referencia para calibrar lentes sobre otros modelos de la familia Qwen3 adaptados a idiomas de bajos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card declara `model-index: []` y un estado de evaluación en curso.

## Requisitos de hardware

- VRAM estimada para inferencia del modelo base: en FP16, aproximadamente 8 GB solo para pesos de un modelo de 4B; con overhead de activaciones y contexto, se recomiendan 12–16 GB.
- Los checkpoints de la lente son ligeros (repositorio total de 1,4 GB), pero requieren cargar el modelo base para su uso.
- GPU recomendadas para el modelo base: NVIDIA RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB); una RTX 3090 (24 GB) o RTX 4080 (16 GB) puede ser suficiente en FP16 con contexto moderado.
- Cabe en GPU de consumo: sí, en tarjetas con al menos 12–16 GB de VRAM para el modelo base en FP16; con cuantización del modelo base (no documentada para la lente) podría reducirse.
- Opciones de despliegue: PyTorch y Transformers para el modelo base; la lente se carga con la librería jlens. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI para los checkpoints de la lente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RuadaptQwen3-4B-JacobianLens-RU | Lente de interpretabilidad sobre Qwen3-4B adaptado al ruso | 4B (base) | no disponible | no disponible | Hugging Face |
| RefalMachine/RuadaptQwen3-4B-Instruct | Modelo instructivo base adaptado al ruso | 4B | no disponible | no disponible | Hugging Face |
| Qwen3-4B (original) | Modelo generativo multilingüe | 4B | no disponible en la información | no disponible en la información | Hugging Face |
| Jacobian Lens (implementación de Anthropic) | Herramienta de interpretabilidad genérica | no aplica | no aplica | no disponible en la información | GitHub |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Carácter experimental: los checkpoints están calibrados con solo 10–50 secuencias de texto; su fiabilidad y generalización no se han evaluado sistemáticamente.
- Los rankings altos de tokens indican decodificabilidad mediante la lente, no implicación causal en el razonamiento del modelo.
- No es un modelo generativo: no debe usarse para producir texto, responder preguntas ni tareas de chat.
- Idiomas: la calibración se limita al ruso; no hay evidencia de validez en otros idiomas.
- Licencia no declarada: no se puede confirmar el uso comercial permitido; es imprescindible contactar con el autor o consultar el modelo base antes de cualquier uso en producción.
- Sesgos: no documentados; al derivar de un modelo base adaptado al ruso, puede heredar sesgos de sus datos de entrenamiento, no analizados en la información disponible.
- Riesgo de alucinación: no aplica directamente al artefacto, pero las interpretaciones derivadas de la lente pueden sobreinterpretarse; se recomienda validación con métodos causales complementarios.
- Sin métricas de rendimiento publicadas ni benchmarks que permitan comparar su calidad frente a otras técnicas de interpretabilidad.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kamawwanai/RuadaptQwen3-4B-JacobianLens-RU
- Modelo base: https://huggingface.co/RefalMachine/RuadaptQwen3-4B-Instruct
- Implementación oficial de Jacobian Lens: https://github.com/anthropics/jacobian-lens
