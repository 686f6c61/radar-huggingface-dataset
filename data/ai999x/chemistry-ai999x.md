# AI999X/chemistry-ai999x

## Resumen

chemistry-ai999x es un motor de resolución de problemas de química publicado por AI999X en Hugging Face bajo licencia Apache 2.0. A pesar de estar etiquetado con `pipeline_tag: question-answering` y contar con pesos en formato safetensors (4.715.520 parámetros), la model card lo describe como un motor compilado —implementado en Rust— que resuelve 119 cálculos de química agrupados en 13 temas: estequiometría, leyes de los gases, disoluciones, equilibrio químico, ácidos y bases, cinética, termoquímica, electroquímica, propiedades moleculares y espectroscopía. Cada cálculo devuelve la fórmula, los pasos intermedios y las unidades, además de una explicación textual cuando falta un dato o está fuera de rango.

El modelo se distribuye en cuatro formatos de uso: aplicación de escritorio (Windows y Linux), interfaz de línea de comandos (`chemistry`), versión web y paquete de Python (`pip install chemistry-ai999x`). Todo el procesamiento ocurre en local, sin conexión a red, lo que el autor presenta como garantía de "cero alucinación": al ser un motor determinista de fórmulas, no genera texto libre ni inventa resultados.

Es relevante para desarrolladores que necesiten integrar cálculos químicos verificables en pipelines educativos o de laboratorio, y para investigadores que quieran una alternativa reproducible a los LLM generativos en tareas de química cuantitativa. Su tamaño reducido y su naturaleza determinista lo alejan del paradigma de los transformers generativos, por lo que debe evaluarse como una herramienta de cálculo más que como un modelo de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Motor de cálculo compilado (Rust), con build en Python puro para plataformas no x86-64; no es un transformer generativo |
| Parametros totales | 4.715.520 (según safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors; distribución adicional como binarios de escritorio/CLI y paquete pip |

## Arquitectura y entrenamiento

La información disponible no describe una arquitectura de red neuronal. La model card indica explícitamente que se trata de "un motor compilado" ("one compiled engine") con implementación en Rust y un build en Python puro para macOS y ARM. No se documentan capas, atención, tokens de entrenamiento, composición del dataset ni procesos de RLHF o DPO. El repositorio ocupa 0.0 GB y los pesos declarados en safetensors suman 4.715.520 parámetros, un orden de magnitud muy inferior al de cualquier LLM moderno, coherente con un motor de reglas y fórmulas más que con un modelo entrenado.

La innovación técnica declarada es la determinación y la trazabilidad: cada uno de los 119 cálculos devuelve fórmula, pasos y unidades, y cuando una entrada falta o está fuera de rango se devuelve una razón en lenguaje natural en lugar de un número. El autor afirma que los resultados son idénticos en Windows y Linux sobre Python 3.10–3.14, lo que sugiere una implementación con aritmética controlada y pruebas multiplataforma, aunque no se detalla la metodología de verificación.

## Capacidades

- Resolución de 119 cálculos de química en 13 temas: estequiometría, leyes de los gases, disoluciones, equilibrio, ácidos y bases, cinética, termoquímica, electroquímica, propiedades moleculares y espectroscopía.
- Salida paso a paso con fórmula, pasos intermedios y unidades para cada cálculo.
- Gestión de entradas ausentes o fuera de rango mediante mensajes explicativos en lugar de resultados numéricos.
- Ejecución totalmente offline, sin llamadas a red.
- Cuatro interfaces: aplicación de escritorio (Windows, Linux), CLI (`chemistry`), versión web y paquete de Python para 3.10+.
- Comportamiento determinista y multiplataforma declarado (Windows y Linux, Python 3.10–3.14).
- No se documentan tool calling, function calling, agentes, razonamiento multi-paso generativo, visión, audio ni modo "thinking".

## Casos de uso

- Docencia de química de bachillerato y universidad: el motor devuelve fórmula, pasos y unidades, lo que permite generar ejercicios resueltos y verificar resultados de forma reproducible sin depender de un LLM generativo.
- Corrección automática de problemas cuantitativos: al ser determinista y offline, puede integrarse en plataformas de evaluación que necesiten una referencia fiable para comparar la respuesta del estudiante con el resultado canónico.
- Integración en cuadernos y scripts de investigación: el paquete `pip install chemistry-ai999x` permite invocar los cálculos desde Python 3.10+ en Windows, Linux, macOS y ARM, útil para preprocesar datos de laboratorio (pH, solubilidad, potenciales de celda) en pipelines reproducibles.
- Herramienta de escritorio para laboratorio: la app de Windows y Linux ofrece escenas y gráficas generadas a partir del resultado calculado, adecuada para uso sin conexión en entornos con red restringida.
- Validación cruzada de resultados de LLM: dado que el motor no alucina por construcción, puede actuar como verificador de respuestas químicas generadas por otros modelos antes de publicarlas o enviarlas a producción.
- Automatización por línea de comandos: la CLI `chemistry` permite encadenar cálculos en scripts de shell para tareas batch (por ejemplo, barridos de pH o de constantes de velocidad a distintas temperaturas).
- Formación interna en empresas químicas: despliegue local sin telemetría para calcular estequiometría, equilibrios o electroquímica en entornos con requisitos de confidencialidad.

## Benchmarks y rendimiento

Los únicos datos disponibles son los declarados por el autor en el `model-index` de la model card. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

| Tarea | Dataset | Métrica | Valor | Verificado |
|---|---|---|---|---|
| Question answering (química) | Golden answers (461 preguntas documentadas, Windows + Linux, Python 3.10–3.14) | Accuracy | 1.0 ("identical on every platform") | No |

El propio `model-index` marca la métrica como `verified: false`, por lo que el 1.0 de accuracy debe interpretarse como una afirmación del autor sobre su conjunto interno de 461 preguntas, no como un resultado validado de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido habitual; el motor no requiere GPU. El repositorio ocupa 0.0 GB y los pesos declarados son 4.715.520 parámetros.
- GPU recomendadas: no se requiere GPU; la ejecución es en CPU.
- Cabe en cualquier equipo de consumo: la app de escritorio está disponible para Windows y Linux x86-64; el paquete pip funciona también en macOS y ARM mediante un build en Python puro.
- Opciones de despliegue: aplicación de escritorio, CLI `chemistry`, versión web y paquete Python (`pip install chemistry-ai999x`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se indica "no disponible" para parámetros, contexto, rendimiento, licencia y disponibilidad de alternativas.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| chemistry-ai999x | 4.715.520 | No disponible | Accuracy 1.0 declarada (no verificada) en 461 preguntas internas | Apache 2.0 | Hugging Face, pip, escritorio, CLI, web |
| Alternativas | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- No es un modelo de lenguaje generativo: no mantiene conversaciones abiertas ni responde preguntas fuera de los 119 cálculos implementados.
- Cobertura limitada a 13 temas y 119 cálculos concretos; cualquier problema fuera de ese catálogo no será resuelto.
- Idioma único: inglés. No se documenta soporte de castellano ni de otros idiomas.
- El resultado de accuracy 1.0 está marcado como no verificado y procede de un conjunto interno de 461 preguntas del propio autor; no hay evaluación independiente.
- No se documentan sesgos, pero al ser un motor determinista el riesgo de alucinación es estructuralmente bajo; el riesgo se traslada a errores de implementación o a fórmulas mal parametrizadas.
- No se especifican limitaciones de contexto porque no aplica un contexto de tokens; sin embargo, la ausencia de documentación sobre rangos válidos de entrada más allá de los mensajes de "fuera de rango" dificulta anticipar el comportamiento en casos límite.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar el archivo LICENSE del repositorio y las condiciones de los binarios distribuidos en GitHub.
- El repositorio ocupa 0.0 GB y la mayor parte del valor está en los binarios y el paquete pip, no en los pesos safetensors; los usuarios deben confiar en la cadena de distribución de GitHub y PyPI.
- No hay soporte documentado para GPU, despliegue en servidores de inferencia estándar (vLLM, TGI) ni integración con frameworks de agentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AI999X/chemistry-ai999x
- Página del modelo en el sitio del autor: https://www.ai999x.com/models/chemistry-ai999x/
- Aplicación de escritorio Windows: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-chemistry-1.6.7-windows-x86_64.zip
- Aplicación de escritorio Linux: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-chemistry-1.6.7-linux-x86_64.tar.gz
- CLI Windows: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-cli-1.6.7-windows-x86_64.zip
- CLI Linux: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-cli-1.6.7-linux-x86_64.tar.gz
- Repositorio de escritorio: https://github.com/AI999X/ai999x-desktop
- Clip de demostración: https://www.ai999x.com/?ax_shot=chemistry-ai999x/clip.mp4
- Paquete Python: `pip install chemistry-ai999x`
