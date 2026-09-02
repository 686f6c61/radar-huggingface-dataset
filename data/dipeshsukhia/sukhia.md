# dipeshsukhia/Sukhia

## Resumen

SukhiaV1.0 es una configuración local para Ollama basada en el modelo Qwen3-8B, creada por el desarrollador Dipesh Sukhia. No se trata de un modelo con pesos fine-tuneados, sino de un `Modelfile` que define un system prompt y una guía de tecnologías específica para asistencia de programación. Está orientado a desarrolladores que trabajan con un stack moderno: PHP 8.3+, Laravel, Node.js, NestJS, React, Next.js, Python, Docker, Terraform y TypeScript.

La relevancia de esta configuración radica en que permite a los equipos de desarrollo desplegar un asistente de código local, privado y gratuito, sin depender de APIs externas. Al estar basado en Qwen3-8B (Apache 2.0), hereda las capacidades generales de razonamiento y generación de código de ese modelo, pero con una personalización de prompt que lo enfoca hacia tareas concretas de desarrollo web y DevOps. Es importante señalar que no es Qwen3-Coder ni un fine-tuning, por lo que sus capacidades específicas de código dependen del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3-8B) |
| Parametros totales | 8 mil millones (8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (depende de la cuantizacion de Qwen3-8B en Ollama) |
| Idiomas soportados | no disponibles (hereda los del modelo base) |
| Licencia | Apache-2.0 |
| Formato de pesos | Modelfile de Ollama (configuracion sobre Qwen3-8B) |

## Arquitectura y entrenamiento

SukhiaV1.0 no es un modelo entrenado de forma independiente. Es una capa de configuración sobre Qwen3-8B, un transformer autoregresivo con 8 mil millones de parámetros desarrollado por Alibaba Cloud. La personalización se realiza mediante un `Modelfile` de Ollama que define un system prompt específico y posiblemente parámetros de muestreo (temperatura, top-p, etc.) orientados a tareas de generación de código.

No hay datos sobre entrenamiento adicional, fine-tuning o RLHF. El autor indica explícitamente que "no es un modelo con pesos fine-tuneados" y que "no se incluyen datos de entrenamiento privados o propietarios". La configuración se limita a instrucciones de sistema que guían al modelo base hacia respuestas centradas en las tecnologías listadas.

## Capacidades

- Generación de código para PHP 8.3+, Laravel, Node.js, NestJS, React, Next.js, Python, Docker, Terraform y TypeScript.
- Asistencia en tareas de desarrollo web full-stack, incluyendo backend, frontend e infraestructura.
- Razonamiento general y resolución de problemas técnicos heredados de Qwen3-8B.
- Soporte de tool calling / function calling: no se menciona explícitamente, pero Qwen3-8B incluye capacidades de tool calling que podrían estar disponibles a través de Ollama.
- Capacidades multilingües: no especificadas, pero Qwen3-8B soporta múltiples idiomas.
- No incluye capacidades de visión ni audio (el modelo base es solo texto).
- No tiene modo "thinking" explícito, aunque Qwen3-8B puede razonar de forma encadenada si se le solicita.

## Casos de uso

- Asistente de desarrollo local para equipos Laravel: el system prompt personalizado permite obtener sugerencias de código, refactorización y depuración de aplicaciones PHP/Laravel sin salir del entorno de desarrollo.
- Generación de componentes React y Next.js: el modelo puede producir componentes funcionales, hooks y páginas completas basadas en descripciones en lenguaje natural, acelerando el desarrollo frontend.
- Automatización de infraestructura con Terraform y Docker: ayuda a escribir archivos de configuración, planificar recursos y resolver errores de despliegue.
- Soporte técnico interno para Node.js y NestJS: responde preguntas sobre APIs, middlewares, autenticación y patrones de diseño en el ecosistema Node.
- Creación de scripts de Python para automatización: genera scripts de procesamiento de datos, integración con APIs y tareas de mantenimiento.
- Entrenamiento y onboarding de nuevos desarrolladores: sirve como guía de referencia rápida para el stack tecnológico de la empresa, reduciendo la curva de aprendizaje.
- Desarrollo offline y privado: al ejecutarse localmente con Ollama, permite trabajar con datos sensibles sin enviar información a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Dado que SukhiaV1.0 es una configuración de prompt sobre Qwen3-8B, su rendimiento en tareas de código será similar al del modelo base, pero no se dispone de métricas específicas para esta configuración.

## Requisitos de hardware

- VRAM estimada para inferencia: Qwen3-8B en FP16 requiere aproximadamente 16 GB de VRAM. Con cuantización Q4_K_M (común en Ollama), se reduce a unos 5-6 GB.
- GPU recomendadas: para FP16, una NVIDIA RTX 3090, RTX 4090, A10 o superior. Para cuantización 4-bit, una RTX 3060 (12 GB) o RTX 4060 Ti (16 GB) es suficiente.
- En CPU: puede ejecutarse en equipos con 16-32 GB de RAM, aunque la latencia será mayor.
- Opciones de despliegue: Ollama (oficial), llama.cpp, o servidores compatibles con OpenAI API como vLLM (si se usa el modelo base).
- Latencia estimada: en GPU consumer con cuantización 4-bit, la generación suele rondar los 20-40 tokens por segundo. En CPU, 5-10 tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| SukhiaV1.0 (sobre Qwen3-8B) | 8B | no disponible | Apache-2.0 | Configuracion de prompt para codigo |
| CodeLlama-7B | 7B | 16K | Llama 2 | Generacion de codigo |
| DeepSeek-Coder-6.7B | 6.7B | 16K | MIT | Generacion de codigo |
| Qwen3-8B (base) | 8B | 32K (segun docs) | Apache-2.0 | Modelo generalista con capacidades de codigo |

SukhiaV1.0 se diferencia de CodeLlama y DeepSeek-Coder en que no es un modelo entrenado específicamente para código, sino una configuración de prompt sobre un modelo generalista. Esto puede limitar su rendimiento en tareas de código muy especializadas, pero ofrece mayor versatilidad para tareas mixtas (razonamiento, conversación, etc.).

## Limitaciones y advertencias

- No es un modelo fine-tuneado para código: su rendimiento en tareas de programación depende de las capacidades generales de Qwen3-8B y puede ser inferior a modelos especializados como Qwen3-Coder o CodeLlama.
- El system prompt personalizado puede no cubrir todos los casos de uso o tecnologías fuera de la lista especificada.
- No ejecuta código ni accede a repositorios privados; solo genera sugerencias y ejemplos.
- No garantiza precisión en versiones de frameworks o librerías; el autor recomienda revisar y probar todo el output.
- Riesgo de alucinación en APIs, funciones o configuraciones poco comunes.
- La licencia Apache-2.0 se aplica a la configuración, pero el modelo base Qwen3-8B tiene su propia licencia (Apache-2.0 también), por lo que se debe cumplir con ambas al redistribuir.
- No se han publicado evaluaciones de sesgos o seguridad para esta configuración específica.

## Enlaces

- [HuggingFace - dipeshsukhia/Sukhia](https://huggingface.co/dipeshsukhia/Sukhia)
- [HuggingFace - dipeshsukhia/SukhiaV1.0](https://huggingface.co/dipeshsukhia/SukhiaV1.0)
- [GitHub - dipeshsukhia/Sukhia](https://github.com/dipeshsukhia/Sukhia)
- [Perfil GitHub - dipeshsukhia](https://github.com/dipeshsukhia)
- [Sitio personal - Dipesh Sukhia](https://dipeshsukhia.github.io/)
- [Modelo base Qwen/Qwen3-8B](https://huggingface.co/Qwen/Qwen3-8B)
