# DeltaILab/Qwen3-4B-MATH-SFT-full-trajectory

## Resumen

Qwen3-4B-MATH-SFT-full-trajectory es un fine-tuning supervisado (SFT) del modelo base Qwen3-4B, desarrollado por DeltaILab, orientado a mejorar el razonamiento matemático mediante entrenamiento con trayectorias completas de resolución de problemas. El repositorio se presenta como un *staging* de prueba (dry-run) para tres repositorios propuestos, y el README especifica explícitamente que no se ha realizado ninguna subida real de pesos. Por tanto, el modelo no está disponible actualmente para descarga en HuggingFace.

El proyecto se basa en un snapshot de datos inmutable con 8753 filas en formato Arrow, que difiere del JSONL legacy (5584 filas) que se menciona como no utilizado en el entrenamiento. El entrenamiento se realizó con SFT y utiliza sharding de optimizador ZeRO-2, restaurando en el paso 68 con `consumed_samples=8754`. El test se define sobre el split histórico `id_eval` con generaciones greedy de hasta 2048 tokens, lo que introduce efectos de completado y truncamiento en las métricas de precisión.

La relevancia de este trabajo reside en explorar el fine-tuning de un modelo de 4B parámetros específicamente en matemáticas, aunque su estado de staging y la ausencia de licencia y de benchmarks publicados limitan su utilidad práctica en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3-4B |
| Parámetros totales | 4B (no se especifican cambios respecto al modelo base) |
| Parámetros activos | No aplicable (modelo denso, no MoE) |
| Longitud de contexto | No disponible en el repo; el modelo base Qwen3-4B soporta 128K tokens |
| Tipos de cuantización | No disponible (el repo solo contiene pesos en safetensors) |
| Idiomas soportados | No disponible (el modelo base Qwen3-4B es multilingüe, pero el fine-tuning no lo declara) |
| Licencia | No disponible (el modelo base Qwen3-4B es Apache 2.0, pero el repo no declara licencia) |
| Formato de pesos | safetensors (según tags del repo) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del transformer Qwen3-4B, que emplea una arquitectura estándar de decoder-only con atención de contexto largo (128K tokens en el modelo base). El entrenamiento SFT se realizó sobre un snapshot de 8753 filas de datos matemáticos (probablemente del dataset MATH o similar, aunque no se especifica), con un pipeline de datos inmutable respaldado por caché. Se utilizó ZeRO-2 para el sharding del optimizador, y el entrenamiento se detuvo en el paso 68 con `consumed_samples=8754`.

No se mencionan técnicas de RLHF ni DPO. El proceso de entrenamiento no incluye RNG (semilla aleatoria), por lo que la continuación desde el checkpoint no es bitwise exacta. Los snapshots de Hugging Face se describen como artefactos de *warm-start*, no como estados de optimizador completos. El README indica que los scripts de subida están en modo dry-run por defecto y requieren `--execute` para realizar una subida real.

## Capacidades

- Razonamiento matemático: el modelo está especializado en resolver problemas matemáticos mediante trayectorias de solución paso a paso (SFT full trajectory).
- Generación de texto: hereda las capacidades generativas del modelo base Qwen3-4B.
- Razonamiento lógico: capacidad general de razonamiento, aunque su especialización es matemática.
- Multilingüismo: el modelo base Qwen3-4B soporta múltiples idiomas, pero no se confirma que el fine-tuning mantenga esa cobertura.
- Sin soporte explícito de tool calling o function calling en la información del repo, aunque el modelo base sí lo incluye.

## Casos de uso

- **Tutoría de matemáticas automatizada**: el modelo puede generar soluciones explicadas paso a paso para problemas de nivel escolar y universitario, útil en plataformas educativas o chatbots de apoyo académico.
- **Generación de problemas matemáticos**: puede crear ejercicios variados y sus soluciones para la creación de contenido educativo.
- **Evaluación de modelos de razonamiento matemático**: sirve como baseline de fine-tuning para comparar mejoras en benchmarks como MATH, GSM8K o AIME.
- **Análisis de errores en soluciones**: al entrenar con trayectorias completas, puede usarse para depurar y corregir soluciones matemáticas generadas por otros modelos.
- **Investigación académica en SFT**: el repo incluye scripts de evaluación y datos que permiten reproducir el proceso de fine-tuning y estudiar el impacto de la restauración de checkpoints.
- **Prototipado de asistentes STEM**: integración en entornos de desarrollo para crear asistentes que resuelvan problemas de álgebra, cálculo o probabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El README menciona que la evaluación se realizó sobre el split histórico `id_eval` con generaciones greedy y un límite de 2048 tokens, pero no se proporcionan métricas concretas. Además, las precisiones incluyen efectos de completado/truncamiento, por lo que no son comparables directamente con otros modelos.

## Requisitos de hardware

- **VRAM estimada**: con pesos en FP16, el modelo de 4B parámetros requiere aproximadamente 8-9 GB de VRAM para inferencia. Con cuantización INT4, se reduce a unos 2.5-3 GB.
- **GPU recomendadas**: puede ejecutarse en tarjetas consumer como RTX 3090, RTX 4090 (24 GB) o RTX 4070 (12 GB) en FP16. Para cuantización INT4, una RTX 3060 (12 GB) o similar es suficiente.
- **Despliegue**: compatible con frameworks como vLLM, llama.cpp, Ollama y TGI, que permiten cargar pesos en safetensors o convertir a GGUF.
- **Latencia y throughput**: no disponible en la información del repo. En un modelo 4B con vLLM, se puede esperar un throughput de varios miles de tokens por segundo en A100/H100, pero no hay datos confirmados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeltaILab/Qwen3-4B-MATH-SFT-full-trajectory | 4B | No disponible (base: 128K) | Matemáticas (SFT) | No disponible | No disponible (dry-run) |
| Qwen/Qwen3-4B | 4B | 128K tokens | General | Apache 2.0 | Disponible en Hugging Face |
| Qwen3-4B-Instruct-2507 | 4B | 128K tokens | General, con modo thinking | Apache 2.0 | Disponible en Hugging Face |

La comparativa se limita al modelo base Qwen3-4B y sus variantes instructivas, ya que no hay otros fine-tunes matemáticos de 4B documentados en la información proporcionada. El modelo de DeltaILab carece de licencia declarada y no está disponible públicamente, por lo que su uso en producción es inviable actualmente.

## Limitaciones y advertencias

- **Estado de staging**: el repositorio es un dry-run y no se ha subido ningún peso real; el modelo no está disponible para descarga.
- **Licencia no declarada**: no se especifica ninguna licencia, lo que impide su uso comercial o académico sin autorización explícita.
- **Datos de entrenamiento no documentados**: no se detalla la composición del dataset MATH (solo el número de filas), ni su origen o calidad.
- **Posibles sesgos**: al ser un fine-tuning especializado en matemáticas, puede tener un sesgo hacia el estilo de los problemas del dataset de entrenamiento, con menor generalización a otros dominios.
- **Riesgo de alucinación**: como todo modelo de lenguaje, puede generar soluciones incorrectas o inventadas, especialmente en problemas matemáticos complejos.
- **Contexto limitado en pruebas**: el test se realiza con un límite de generación de 2048 tokens, lo que puede afectar la precisión en problemas que requieren respuestas más largas.
- **Ausencia de resultados de benchmarks**: no se han publicado métricas comparativas, por lo que no se puede evaluar su rendimiento real frente a otros modelos.
- **Reproducibilidad**: el RNG no está incluido en el checkpoint, por lo que la continuación del entrenamiento no es bitwise exacta, lo que puede afectar a la reproducibilidad de los experimentos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/DeltaILab/Qwen3-4B-MATH-SFT-full-trajectory
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Informe técnico de Qwen3 (arXiv): https://arxiv.org/html/2505.09388v1
- Página de Qwen3-4B en Open Laboratory: https://openlaboratory.com/models/qwen3-4b/
