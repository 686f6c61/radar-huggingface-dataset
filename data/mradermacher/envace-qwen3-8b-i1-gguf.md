# mradermacher/EnvACE-Qwen3-8B-i1-GGUF

## Resumen

EnvACE-Qwen3-8B es un modelo de lenguaje de 8.190.735.360 parámetros, desarrollado por el equipo Team-ACE como modelo base y posteriormente cuantizado por mradermacher en formato GGUF. Se trata de un modelo afinado mediante reinforcement learning a partir de Qwen3-8B, orientado específicamente a tareas de agente, uso de herramientas y llamadas a funciones (function calling). Su propuesta principal es actuar como un modelo de mundo (world-model) capaz de razonar sobre entornos y tomar decisiones multi-paso.

Esta versión concreta, `mradermacher/EnvACE-Qwen3-8B-i1-GGUF`, contiene cuantizaciones con matriz de importancia (imatrix) de alta calidad, disponibles en un amplio rango de tamaños, desde IQ1_S (2.2 GB) hasta Q6_K (6.8 GB). El repositorio ocupa 96.4 GB en total e incluye también el archivo de imatrix para generar cuantizaciones propias. La licencia es Apache 2.0 y el modelo soporta únicamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso basado en Qwen3-8B |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-IQ4_NL, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con archivo de imatrix) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-8B, un transformer denso de 8.190 millones de parámetros. Sobre esta base, el equipo Team-ACE aplicó un proceso de reinforcement learning para potenciar capacidades de agente, tool-use y function calling, además de un enfoque de world-model que permite al modelo razonar sobre estados y acciones en entornos simulados o reales. No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens ni si se utilizaron técnicas como RLHF o DPO.

Las cuantizaciones presentes en este repositorio han sido generadas por mradermacher utilizando el método i1 con imatrix, que preserva mejor la calidad en niveles de compresión bajos en comparación con cuantizaciones estáticas equivalentes. El archivo `EnvACE-Qwen3-8B.imatrix.gguf` (0.1 GB) se incluye para que los usuarios puedan crear sus propias cuantizaciones.

## Capacidades

- Generación de texto y razonamiento general, heredadas de Qwen3-8B.
- Soporte de tool calling y function calling, lo que permite integrar el modelo en sistemas que requieren invocar APIs o ejecutar acciones externas.
- Uso como agente autónomo, con capacidad de planificar y ejecutar tareas multi-paso.
- Modelado de mundo (world-model), orientado a razonar sobre el estado de un entorno y predecir consecuencias de acciones.
- Idioma inglés como único idioma soportado.
- Compatibilidad con el ecosistema GGUF, lo que facilita su despliegue en entornos locales y de servidor.

## Casos de uso

- Automatización de tareas con herramientas: el modelo puede recibir instrucciones, llamar a funciones externas (por ejemplo, consultar una base de datos, enviar un correo o ejecutar un script) y encadenar varias llamadas para completar un flujo complejo.
- Agentes de atención al cliente: gracias a su capacidad de function calling, puede gestionar conversaciones multi-turno, consultar información en sistemas de ticketing y ejecutar acciones como crear tickets o actualizar registros.
- Asistentes de desarrollo de software: en un entorno de CI/CD, el modelo puede revisar código, ejecutar comandos mediante tool calls, interpretar resultados y sugerir correcciones, actuando como un agente de automatización.
- Investigación y análisis de datos: puede actuar como agente que consulta APIs de datos, razona sobre los resultados y genera informes, aprovechando su capacidad de modelado de mundo para interpretar estados y tendencias.
- Simulación de entornos: el enfoque de world-model permite usarlo en simulaciones donde debe planificar acciones y prever sus efectos, como en juegos, robótica o procesos de decisión secuencial.
- Orquestación de pipelines de automatización: el modelo puede integrarse en sistemas de flujo de trabajo, donde coordina múltiples herramientas y servicios mediante llamadas a funciones, manteniendo el razonamiento sobre el estado global del proceso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia, según cuantización (basada en el tamaño del archivo):
  - i1-Q2_K (3.4 GB): mínimo 4-6 GB de VRAM.
  - i1-Q4_K_M (5.1 GB): recomendado 8-10 GB de VRAM.
  - i1-Q5_K_M (6.0 GB): recomendado 10-12 GB de VRAM.
  - i1-Q6_K (6.8 GB): recomendado 12 GB o más de VRAM.
- GPU recomendadas: RTX 3060 12GB para cuantizaciones Q4_K_M o inferiores; RTX 3090 o RTX 4090 para Q5_K_M y Q6_K; A100 o H100 para despliegues de alta concurrencia.
- Las cuantizaciones más pequeñas (i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS) pueden ejecutarse en GPUs de 4 GB, aunque con una calidad significativamente reducida.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp. No se recomienda vLLM ni TGI para archivos GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han encontrado datos comparativos con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo soporta inglés, por lo que su uso en otros idiomas requerirá traducción o adaptación.
- Las cuantizaciones más agresivas (i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS) presentan una calidad muy baja y deben usarse únicamente en entornos de prueba o con requisitos de memoria extremos.
- El proceso de cuantización con imatrix puede introducir pequeñas degradaciones en el rendimiento con respecto al modelo original en punto flotante.
- Existe riesgo de alucinación, especialmente cuando el modelo razona sobre entornos o estados que no ha visto durante el entrenamiento.
- No se dispone de información sobre sesgos específicos del modelo. Se recomienda realizar evaluaciones propias antes de desplegar en producción.
- La licencia Apache 2.0 permite uso comercial, pero es necesario verificar las condiciones del modelo base Team-ACE/EnvACE-Qwen3-8B y de Qwen3-8B para asegurar el cumplimiento de todas las cláusulas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/EnvACE-Qwen3-8B-i1-GGUF
- Modelo base: https://huggingface.co/Team-ACE/EnvACE-Qwen3-8B
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/EnvACE-Qwen3-8B-GGUF
- Página de mradermacher: https://huggingface.co/mradermacher
- Solicitud de modelos: https://huggingface.co/mradermacher/model_requests
