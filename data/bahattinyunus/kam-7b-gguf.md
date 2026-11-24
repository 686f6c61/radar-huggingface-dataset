# bahattinyunus/kam-7b-gguf

## Resumen

KAM-7B (Ulu Kam) es un modelo de lenguaje de 7.615.616.512 parámetros publicado por el desarrollador independiente Bahattin Yunus Çetin bajo el identificador `bahattinyunus/kam-7b-gguf`. Según la model card, se trata de una adaptación del modelo base Qwen 2.5 7B orientada a turco ("duru Türkçe") y a un marco conceptual que el autor denomina "Active Inference" (inferencia activa) inspirado en el principio de energía libre de Karl Friston. El modelo se distribuye principalmente en formato GGUF para su uso con Ollama y despliegue local aislado (air-gapped).

El modelo forma parte de una "flota" de ocho repositorios publicados por el mismo autor (kam:apex basado en Qwen3-8B, kam:r1 basado en DeepSeek-R1 7B, kam:coder, variantes nano de 1.5B y un módulo Edge-MoE de 848 parámetros). La model card mezcla la descripción del modelo de lenguaje con la de un "motor de sistema operativo cognitivo autónomo" que incluye componentes externos al modelo (agentes ReAct/CodeAct, hooks eBPF, JIT en C++20, módulos de ciberdefensa). Es importante separar esas afirmaciones del comportamiento verificable del propio modelo de pesos.

La relevancia del modelo es limitada y debe contextualizarse: se trata de un proyecto individual, con 351 descargas y 0 likes en el momento de la consulta, sin benchmarks publicados en la información disponible y con una model card que contiene afirmaciones técnicas no verificables (por ejemplo, "100.0% Benchmark" sin especificar el conjunto de evaluación). Resulta útil como ejemplo de fine-tuning comunitario en turco sobre Qwen 2.5, pero no como modelo de referencia para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen 2.5 7B; no se detalla la arquitectura interna en la informacion disponible) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es un modelo MoE según la informacion disponible) |
| Longitud de contexto | 16K tokens (según la model card: "16K bağlamlı") |
| Tipos de cuantizacion | GGUF (el repo pesa 4,7 GB; no se detallan los niveles de cuantizacion disponibles) |
| Idiomas soportados | turco (tr), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo `kam-7b-gguf`); el dato de parámetros procede de safetensors según la información de Hugging Face |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de indicar que el modelo deriva de Qwen 2.5 7B, un transformer decoder-only con atención completa estándar. El autor etiqueta el proyecto con conceptos como "liquid-neural-networks", "bitnet-b158" y "active-inference", pero esos términos aparecen asociados al ecosistema KAM en su conjunto (incluido el módulo Edge-MoE de 848 parámetros) y no se documenta que el modelo de 7B implemente capas de redes neuronales líquidas ni cuantización BitNet b1.58. No se especifica el número de tokens de entrenamiento, la composición del dataset de ajuste ni si se aplicaron fases de RLHF o DPO.

Tampoco se documentan innovaciones técnicas verificables en el propio modelo de pesos (decodificación especulativa, atención lineal, etc.). Las afirmaciones sobre hooks eBPF con latencias inferiores a 12 μs, parcheo JIT en memoria en 41,2 ms o agentes ReAct de seis pasos corresponden a componentes de software del repositorio GitHub del autor, no al modelo de lenguaje, y no pueden atribuirse a los pesos publicados en este repositorio.

## Capacidades

- Generación de texto conversacional en turco e inglés.
- Comprensión y generación en turco, presumiblemente reforzada mediante ajuste fino sobre Qwen 2.5 (no se documenta el método).
- Razonamiento y respuesta multi-turno dentro de una ventana de 16K tokens.
- Integración con Ollama mediante `ollama run hf.co/bahattinyunus/kam-7b-gguf`.
- Soporte de tool calling y function calling: no documentado en la información disponible.
- Capacidades de agente y razonamiento multi-paso: atribuidas al ecosistema KAM (ReAct + CodeAct), no verificadas en el modelo de pesos.
- Capacidades de visión o audio: no disponibles.
- Modo "thinking" explícito: no documentado para este modelo (sí para la variante kam:r1 basada en DeepSeek-R1).

## Casos de uso

- Asistencia conversacional en turco: el modelo puede gestionar diálogos multi-turno en turco con una ventana de 16K tokens, adecuado para chatbots de atención al cliente orientados al mercado turco donde se priorice el despliegue local.
- Despliegue air-gapped en entornos con requisitos de soberanía de datos: al distribuirse en GGUF y ejecutarse con Ollama, puede operar sin conexión a servicios en la nube, útil en administraciones públicas o sectores regulados que exijan procesamiento local.
- Prototipado rápido en estaciones de trabajo: su tamaño de 4,7 GB en GGUF permite probar el modelo en portátiles con GPU de consumo, sirviendo para validar ideas antes de migrar a modelos mayores.
- Generación de contenido en turco: redacción de borradores, resúmenes y respuestas dentro de aplicaciones editoriales o de soporte interno donde el idioma principal sea el turco.
- Base para experimentación académica sobre ajuste fino: al estar construido sobre Qwen 2.5 7B y publicarse con licencia Apache 2.0, puede servir como punto de partida para estudiar técnicas de adaptación lingüística en turco.
- Evaluación comparativa de la familia KAM: útil para investigadores interesados en analizar las diferencias entre las variantes del autor (apex, r1, coder) sobre distintas bases (Qwen3-8B, DeepSeek-R1 7B, Qwen 2.5 7B).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona "100.0% Benchmark" y "60/60 Tests Passing", pero no especifica qué conjunto de evaluación, metodología ni métricas se emplearon, por lo que estos datos no son verificables ni comparables.

## Requisitos de hardware

- VRAM estimada: aproximadamente 5-6 GB para el archivo GGUF de 4,7 GB con overhead de contexto; entre 15 y 16 GB en FP16 (7.615 millones de parámetros × 2 bytes).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090 para cuantizaciones mayores y contextos largos; A100/H100 solo si se requiere FP16 y alto throughput.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más de VRAM usando cuantizaciones GGUF de 4-5 bits; en 6 GB puede requerir cuantización Q4 y contexto reducido.
- Opciones de despliegue: Ollama (soporte oficial según la model card), llama.cpp por ser formato GGUF, y potencialmente vLLM o TGI si se convierte a safetensors (no documentado).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| KAM-7B (Ulu Kam) | 7,6B | 16K | Apache 2.0 | GGUF en HF | Ajuste comunitario sobre Qwen 2.5 7B, foco en turco |
| Qwen 2.5 7B (base) | 7,6B | 128K (según documentación de Alibaba) | Apache 2.0 | safetensors, GGUF, múltiples proveedores | Modelo base original; benchmarks públicos extensos |
| Llama 3.1 8B | 8B | 128K | Llama 3.1 Community License | safetensors, GGUF | Alternativa generalista con licencia no Apache |
| Mistral 7B v0.3 | 7,2B | 32K | Apache 2.0 | safetensors, GGUF | Alternativa europea con soporte multilingüe |

La comparación con el Qwen 2.5 7B original es la más directa, dado que KAM-7B deriva de él. No se dispone de datos que permitan afirmar mejoras medibles sobre la base en tareas de turco.

## Limitaciones y advertencias

- Ausencia de benchmarks verificables: las afirmaciones de rendimiento de la model card no están respaldadas por metodología pública.
- Riesgo de alucinación: como cualquier modelo de 7B, especialmente sin datos de evaluación publicados; el ajuste fino sobre una base generalista puede incrementar la confianza en respuestas incorrectas.
- Sesgos: no documentados; el ajuste en turco puede introducir sesgos culturales o lingüísticos no evaluados.
- Cobertura limitada de idiomas: solo turco e inglés; no se garantiza un rendimiento aceptable en castellano u otros idiomas.
- Contexto de 16K: inferior a los 128K de la base Qwen 2.5 7B, lo que puede limitar tareas de documento largo.
- Discrepancia entre la model card y el modelo: gran parte del contenido describe un sistema de agentes y ciberdefensa externo al modelo; no debe asumirse que los pesos incorporen esas capacidades.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene auditar el modelo antes de integrarlo en producción.
- Proyecto individual con escasa tracción (351 descargas, 0 likes): sin comunidad de validación ni mantenimiento garantizado.
- Fecha de creación indicada como 2026-11-03 en los metadatos, lo que resulta anómala y conviene verificar.

## Enlaces

- Hugging Face: https://huggingface.co/bahattinyunus/kam-7b-gguf
- Repositorio GitHub del proyecto: https://github.com/bahattinyunus/kam
- Variante kam:apex (Qwen3-8B): https://huggingface.co/bahattinyunus/kam-apex-8b-gguf
- Variante kam:r1 (DeepSeek-R1 7B): https://huggingface.co/bahattinyunus/kam-r1-gguf
- Variante kam:coder: https://huggingface.co/bahattinyunus/kam-coder-7b-gguf
- Variante kam:r1-nano (1.5B): https://huggingface.co/bahattinyunus/kam-r1-nano-1.5b-gguf
- Variante kam:coder-nano (1.5B): https://huggingface.co/bahattinyunus/kam-coder-nano-1.5b-gguf
- Variante kam:1.5b-edge: https://huggingface.co/bahattinyunus/kam-1.5b-edge-gguf
- Módulo KAM-Edge-MoE (BitNet b1.58): https://huggingface.co/bahattinyunus/kam-edge-moe-b158
- Perfil del autor: https://github.com/bahattinyunus
