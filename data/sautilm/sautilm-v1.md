# sautilm/SautiLM-v1

## Resumen

SautiLM-v1 es un modelo de lenguaje ultracompacto desarrollado por LosingTek Research (Bunia, Ituri, República Democrática del Congo) a partir de un ajuste fino por LoRA de Google Gemma 3 270M IT. El objetivo es ofrecer generación de texto completamente offline en teléfonos Android de gama de entrada (2-4 GB de RAM) para comunidades lingüísticas marginadas del este de la RDC, con especial atención al bbadha (kilendu), el suajili y el francés.

El modelo se distribuye en un contenedor nativo `.litertlm` de 145 MB o menos y se ejecuta mediante el runtime LiteRT-LM, orientado a despliegues edge en Flutter. La propuesta de valor no es el rendimiento bruto, sino la viabilidad operativa: cero conexión a internet, cero coste de datos y consumo térmico reducido en hardware muy limitado.

Se presenta como la base unificada de cinco dominios especializados (lexicografía, educación, matemáticas contextuales, salud comunitaria y derecho congoleño), aunque esta primera versión integra el corpus de entrenamiento de todos ellos en un único checkpoint ajustado sobre 22.834 instrucciones verificadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma3ForCausalLM), 18 capas, hidden_size=640 |
| Parametros totales | 270M (heredados de google/gemma-3-270m-it) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuye en contenedor `.litertlm` de <= 145 MB) |
| Idiomas soportados | sw (suajili), fr (frances), en (ingles); corpus adicional en bbadha (kilendu) |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | `.litertlm` (LiteRT-LM); pesos originales en safetensors no disponibles en el repositorio |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Gemma 3 en su variante de 270M parámetros con ajuste de instrucciones (IT): un transformer decoder-only de 18 capas con dimensión oculta de 640. Sobre esa base se aplicó un ajuste supervisado (SFT) mediante LoRA con rango 16 y alpha 32 durante 240 pasos, según la model card. El resultado se comprimió a un contenedor LiteRT-LM nativo de 145 MB o menos.

El corpus de entrenamiento consta de 22.834 instrucciones verificadas que combinan 1.150 entradas lexicográficas de bbadha (con fonética, clases gramaticales, acepciones múltiples y ejemplos trilingües bbadha-suajili-francés), material curricular de ciencias y biología, aritmética contextual orientada a comercio ganadero y lácteo en francos congoleños, guías sanitarias de tres pasos y contenido jurídico basado en la Constitución de la RDC, el Código de Familia revisado (Loi n° 16/008), el Código Penal, el Código Laboral y el derecho OHADA. No se documentan fases de RLHF ni DPO, ni el número total de tokens de entrenamiento.

## Capacidades

- Generación de texto en suajili, francés e inglés, con cobertura léxica adicional de bbadha (kilendu).
- Consulta lexicográfica y traducción trilingüe bbadha-suajili-francés a partir de 1.150 entradas verificadas.
- Explicaciones educativas alineadas con el currículo: ciclo del agua, energía solar, reforestación y biología, con cuestionarios interactivos.
- Aritmética contextual paso a paso orientada a inventario ganadero, comercio lácteo en francos congoleños y distribución de recursos escolares.
- Guías sanitarias comunitarias y veterinarias de tres pasos: purificación de agua, prevención de cólera y malaria, nutrición y cuidado del ganado.
- Asistencia jurídica offline fundamentada en normativa congoleña (Constitución, Código de Familia, Código Penal, Código Laboral) y derecho OHADA.
- Ejecución 100% offline en dispositivo, sin llamadas a red.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso con agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Traducción y consulta lexicográfica de campo: un hablante de bbadha puede consultar acepciones, clases gramaticales y ejemplos trilingües sin conexión, usando las 1.150 entradas del corpus lexicográfico integrado.
- Tutor de lengua materna en aulas rurales: el modelo ofrece explicaciones curriculares de ciencias y biología y cuestionarios interactivos en un teléfono Android de 2 GB de RAM, sin coste de datos para el alumno.
- Alfabetización jurídica offline: ciudadanos, abogados y magistrados en zonas sin cobertura pueden consultar disposiciones de la Constitución de la RDC, el Código de Familia y el derecho OHADA directamente en el dispositivo.
- Apoyo a agentes de salud comunitarios: guías accionables de tres pasos sobre purificación de agua, prevención de cólera y malaria y nutrición, consultables en entornos sin conectividad.
- Gestión de comercio ganadero y lácteo: cálculo paso a paso de inventario de ganado y liquidación de ventas en francos congoleños para pastores y comerciantes locales.
- Atención veterinaria básica en zonas rurales: pautas de cuidado del ganado accesibles desde el teléfono, sin depender de un veterinario presencial.
- Distribución de recursos escolares: cálculo aritmético contextual para repartir material educativo entre aulas, con justificación paso a paso verificable por el docente.
- Integración en aplicaciones Flutter: mediante `flutter_edge_ai` y `flutter_edge_ai_litertlm` (v1.19+), el modelo puede embeberse en apps Android 8.0+ (API 26+) con CPU ARM Cortex-A53/A55 o GPU móvil.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el escenario objetivo (ejecución en CPU/GPU móvil); el bundle ocupa 145 MB o menos en almacenamiento.
- RAM mínima documentada: 2 GB; rango objetivo de 2-4 GB en smartphones Android de gama de entrada.
- Hardware mínimo: Android 8.0+ (API 26+), CPU ARM Cortex-A53/A55 o GPU móvil.
- GPU de escritorio recomendadas: no disponibles; el modelo está empaquetado para LiteRT-LM, no para despliegue en servidor.
- ¿Cabe en GPU consumer? No se documenta soporte para GPUs de escritorio (RTX 4090, etc.); el formato `.litertlm` está orientado a dispositivos móviles.
- Opciones de despliegue: runtime LiteRT-LM a través de Flutter (`flutter_edge_ai` + `flutter_edge_ai_litertlm` v1.19+). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| SautiLM-v1 | 270M | no disponible | sw, fr, en (+ bbadha en corpus) | gemma | `.litertlm`, LiteRT-LM en Android |
| google/gemma-3-270m-it | 270M | no disponible | multilingue (segun Gemma 3) | gemma | safetensors, GGUF, LiteRT; amplio soporte de runtimes |
| Qwen2.5-0.5B-Instruct | 500M | no disponible | multilingue | Apache 2.0 | safetensors, GGUF; llama.cpp, Ollama, vLLM |
| SmolLM2-360M-Instruct | 360M | no disponible | principalmente ingles | Apache 2.0 | safetensors, GGUF; llama.cpp, transformers |

La comparación relevante es con el modelo base: SautiLM-v1 añade especialización lingüística y jurídica para la RDC y un empaquetado móvil de 145 MB, a costa de perder el soporte multilingüe amplio y la compatibilidad con runtimes estándar de servidor. Frente a Qwen2.5-0.5B y SmolLM2-360M, la diferencia clave es la licencia (Gemma frente a Apache 2.0) y la ausencia de ecosistema de despliegue generalista.

## Limitaciones y advertencias

- Tamaño muy reducido (270M parámetros): capacidad de razonamiento, coherencia en contextos largos y generalización limitadas en comparación con modelos de miles de millones de parámetros.
- Riesgo elevado de alucinación, especialmente en dominios sensibles como derecho, salud y veterinaria; las respuestas jurídicas o médicas no deben usarse sin verificación profesional.
- Cobertura lingüística desigual: el bbadha aparece en el corpus pero no figura como idioma declarado en los metadatos; el suajili, francés e inglés pueden tener calidad heterogénea tras un ajuste de solo 240 pasos.
- Corpus de entrenamiento pequeño (22.834 instrucciones) y sin documentación de tokens totales, composición exacta ni proceso de filtrado; riesgo de sobreajuste al formato de las instrucciones de entrenamiento.
- Licencia Gemma: impone restricciones de uso comercial y obligaciones de la Gemma Terms of Use; es necesario revisar los términos antes de cualquier despliegue en producción.
- Formato propietario `.litertlm`: dependencia del runtime LiteRT-LM y del ecosistema Flutter; no hay pesos en safetensors ni GGUF publicados, lo que dificulta la auditoría, el reentrenamiento o el despliegue fuera de Android.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente al modelo base ni frente a alternativas.
- Longitud de contexto no documentada: no se puede garantizar el comportamiento en conversaciones multi-turno largas.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: ecosistema de validación externa inexistente.
- Sesgos potenciales derivados del corpus base de Gemma 3 y del corpus local, no evaluados por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sautilm/SautiLM-v1
- Modelo base: https://huggingface.co/google/gemma-3-270m-it
- Sitio web del proyecto: https://sautilm.com
- Runtime LiteRT-LM: no disponible en la información proporcionada
- Paper o blog técnico: no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
