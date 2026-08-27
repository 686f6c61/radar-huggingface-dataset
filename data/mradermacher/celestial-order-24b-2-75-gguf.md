# mradermacher/Celestial-Order-24B-2.75-GGUF

## Resumen

Celestial-Order-24B-2.75 es un modelo de lenguaje de gran tamaño con 23.572.403.200 parámetros (aproximadamente 23,57B), desarrollado originalmente por Sorihon y posteriormente cuantizado a formato GGUF por mradermacher. Esta ficha se centra en la versión cuantizada `mradermacher/Celestial-Order-24B-2.75-GGUF`, que ofrece múltiples niveles de cuantización (Q2_K, Q3_K, Q4_K, Q5_K, Q6_K, Q8_0, IQ4_XS, entre otros) para facilitar su ejecución en hardware variado, desde CPU hasta GPU con memoria limitada.

El modelo original no dispone de información pública detallada sobre su arquitectura, entrenamiento o licencia en la model card proporcionada. No obstante, la existencia de esta cuantización indica que se trata de un modelo de propósito conversacional, como refleja la etiqueta "conversational". La relevancia de esta versión GGUF radica en su compatibilidad con motores de inferencia como llama.cpp, Ollama o LM Studio, lo que permite desplegarlo localmente en equipos de consumo sin necesidad de infraestructura de servidor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 23.572.403.200 |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible (el modelo original V2 indica 128K, pero no se confirma para esta version) |
| Tipos de cuantizacion | x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento
No se dispone de información pública sobre la arquitectura interna (si es transformer denso, MoE, híbrido, etc.) ni sobre los datos de entrenamiento (número de tokens, composición del dataset, métodos de alineación como RLHF o DPO). El autor de la cuantización, mradermacher, se limita a indicar que se trata de "static quants" del modelo original `Sorihon/Celestial-Order-24B-2.75`. Por tanto, cualquier innovación técnica específica (atención lineal, decodificación especulativa, etc.) es desconocida.

## Capacidades
No se dispone de una lista de capacidades verificada para este modelo. Según la etiqueta "conversational" en Hugging Face, se espera que el modelo sea adecuado para tareas de diálogo, pero no se pueden confirmar otras habilidades como generación de código, razonamiento matemático, tool calling o capacidades multimodales. Tampoco hay evidencia de soporte para agentes o razonamiento multi-paso.

## Casos de uso
Dado que se trata de una cuantización GGUF de un modelo de 24B, los casos de uso prácticos son los típicos de modelos de chat de tamaño medio, aunque sin confirmar capacidades específicas:

- **Despliegue local de un asistente conversacional**: el formato GGUF permite ejecutar el modelo en CPU o GPU de consumo mediante llama.cpp, Ollama o LM Studio, ideal para entornos sin conexión o con requisitos de privacidad.
- **Prototipado rápido de chatbots**: con la cuantización Q4_K_M se puede ejecutar en tarjetas gráficas con 8-12 GB de VRAM, facilitando la experimentación en entornos de desarrollo.
- **Generación de texto en español**: al ser un modelo de lenguaje general, es plausible su uso para redacción, resumen o traducción, aunque no se ha confirmado su calidad multilingüe.
- **Integración en aplicaciones de escritorio**: gracias a la compatibilidad con endpoints (etiqueta "endpoints_compatible"), se puede servir como API local en herramientas de productividad.
- **Investigación académica**: para estudiar el comportamiento de modelos de 24B en configuraciones de cuantización baja (Q2_K, Q3_K) sin necesidad de grandes recursos.
- **Aprendizaje y demostraciones**: como ejemplo de despliegue de modelos de gran tamaño en hardware modesto, útil en talleres y tutoriales.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K ni otros indicadores de rendimiento para este modelo concreto.

## Requisitos de hardware
- **VRAM estimada**: para la cuantización Q4_K_M, se estima un uso de memoria de aproximadamente 13-14 GB (23.572.403.200 × 4.5 bits / 8 ≈ 13.2 GB) más overhead de contexto. Para Q2_K, alrededor de 7-8 GB; para Q8_0, cerca de 23 GB.
- **GPU recomendadas**: tarjetas con 12 GB o más (RTX 3060, RTX 4080, A4000) para cuantizaciones bajas; para Q8_0 se requieren GPUs de 24 GB o más (RTX 3090, A5000, A100).
- **Compatibilidad con CPU**: los archivos GGUF pueden ejecutarse en CPU mediante llama.cpp, aunque con menor rendimiento.
- **Opciones de despliegue**: llama.cpp, Ollama, LM Studio, GPT4All, y servidores compatibles con el protocolo OpenAI (por la etiqueta "endpoints_compatible").
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares
No se dispone de información sobre otros modelos de la misma categoría (24B) que permita una comparación objetiva en términos de rendimiento, contexto o licencia. Se recomienda consultar benchmarks de modelos como Qwen 24B, Llama 3.1 24B (si existen) o Mixtral 8x7B, pero no se pueden ofrecer datos verificados.

## Limitaciones y advertencias
- **Falta de documentación**: no se conoce la arquitectura ni el proceso de entrenamiento, lo que dificulta evaluar su comportamiento en producción.
- **Licencia desconocida**: al no especificarse, no se puede garantizar su uso comercial; se debe contactar con el autor original (Sorihon) para aclarar los términos.
- **Riesgo de alucinación**: como modelo de lenguaje, puede generar contenido falso o inventado, especialmente en cuantizaciones muy agresivas (Q2_K) que degradan la calidad.
- **Sesgos no documentados**: no se han publicado evaluaciones de sesgos o riesgos de contenido dañino.
- **Contexto limitado**: aunque el modelo original V2 menciona 128K, no se confirma para esta versión 2.75; la ventana real de contexto debe verificarse en la implementación de GGUF.
- **Compatibilidad de cuantización**: algunas cuantizaciones como IQ4_XS requieren soporte específico del backend de inferencia; no todos los motores las admiten.

## Enlaces
- [Modelo en Hugging Face (mradermacher/Celestial-Order-24B-2.75-GGUF)](https://huggingface.co/mradermacher/Celestial-Order-24B-2.75-GGUF)
- [Modelo original (Sorihon/Celestial-Order-24B-2.75)](https://huggingface.co/Sorihon/Celestial-Order-24B-2.75)
- [Página del autor mradermacher](https://huggingface.co/mradermacher)
- [Modelo V2 de Sorihon (para referencia)](https://huggingface.co/Sorihon/Celestial-Order-24B-V2)
