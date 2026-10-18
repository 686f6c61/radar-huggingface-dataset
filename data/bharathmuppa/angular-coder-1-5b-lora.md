# bharathmuppa/angular-coder-1.5b-lora

## Resumen

angular-coder-1.5b-lora es un adaptador LoRA publicado por bharathmuppa para especializar Qwen/Qwen2.5-Coder-1.5B-Instruct en tareas de desarrollo con Angular. No es un modelo completo: se aplica sobre el modelo base mediante mlx-lm y añade conocimiento de dominio sobre componentes, servicios, plantillas y novedades de Angular, como ilustra el ejemplo de la model card sobre Angular 20.

El adaptador tiene rango 16, escala 20, dropout 0,05 y se entrena sobre las últimas 16 capas, con las proyecciones q/k/v/o y gate/up/down del MLP. Su repositorio ocupa 0,1 GB, por lo que está pensado para inferencia local en Apple Silicon con MLX. La propuesta es relevante para equipos que quieran un asistente de código Angular ligero, privado y ejecutable en un portátil Mac, sin depender de APIs externas.

No se detallan en la información disponible el dataset de entrenamiento, el número de tokens, la longitud de contexto efectiva ni resultados de evaluación. La model card remite a la ficha del modelo fusionado para los detalles de datos y entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen2.5-Coder-1.5B-Instruct; arquitectura del modelo base no especificada en la información |
| Parámetros totales | 1,5B en el modelo base; parámetros del adaptador no disponibles (repositorio de 0,1 GB) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información proporcionada; depende del modelo base |
| Tipos de cuantización | No disponibles; el adaptador se distribuye para mlx-lm y no se documentan variantes cuantizadas |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | Adaptador LoRA para MLX (mlx-lm); no se especifica el formato exacto de los ficheros ni se ofrece GGUF |
| Modelo base | Qwen/Qwen2.5-Coder-1.5B-Instruct |
| Tamaño del repositorio | 0,1 GB |
| Módulos adaptados | Proyecciones q/k/v/o y gate/up/down; últimas 16 capas |
| Hiperparámetros LoRA | Rango 16, escala 20, dropout 0,05 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, no un modelo entrenado desde cero. Se aplica sobre Qwen2.5-Coder-1.5B-Instruct y modifica las proyecciones de atención q/k/v/o y las proyecciones MLP gate/up/down en las últimas 16 capas. Los hiperparámetros declarados son rango 16, escala 20 y dropout 0,05. Esto reduce el número de parámetros entrenables y permite distribuir un repositorio de 0,1 GB, pero obliga a cargar el modelo base completo para inferir.

No se especifican en la model card el corpus de entrenamiento, el número de tokens, la mezcla de datos Angular/TypeScript, ni si hubo RLHF, DPO o ajuste supervisado. Tampoco se documentan técnicas como decodificación especulativa o atención lineal. La card indica que los detalles de datos y entrenamiento están en la ficha del modelo fusionado bharathmuppa/angular-coder-1.5b.

## Capacidades

- Generación y explicación de código Angular y TypeScript, incluyendo componentes, servicios, directivas, pipes y plantillas, sujeto a la calidad del adaptador y del modelo base.
- Respuesta a preguntas sobre cambios y novedades de Angular; la model card usa como ejemplo la consulta "What is new in Angular 20?".
- Seguimiento de instrucciones en lenguaje natural heredado de Qwen2.5-Coder-1.5B-Instruct.
- Asistencia para refactorización, depuración y generación de pruebas unitarias en proyectos Angular, si el adaptador ha sido entrenado con esos datos; no confirmado.
- No se documentan capacidades de visión, audio, tool calling, function calling ni agentes multi-paso para este adaptador.
- Soporte multilingüe no disponible; la model card no declara idiomas.
- No dispone de modo thinking explícito ni decodificación especulativa documentada.

## Casos de uso

- Asistente local de Angular en Mac: cargar el adaptador con mlx-lm sobre Qwen2.5-Coder-1.5B-Instruct y consultar dudas de Angular 20, cambios de API y ejemplos de componentes. Es adecuado por el bajo peso del adaptador y porque MLX aprovecha Apple Silicon.
- Generación de fragmentos en el editor: completar componentes, servicios e imports de Angular pegando el contexto en el prompt. La utilidad está limitada por la ventana de contexto no documentada.
- Migración de versiones de Angular: preguntar por diferencias entre versiones y alternativas a APIs obsoletas; útil como primer borrador, con revisión posterior por parte del equipo.
- Privacidad de código propietario: ejecutar la inferencia en local sin enviar código a servicios cloud; MLX en Mac permite un flujo offline.
- Formación y onboarding: explicar conceptos de Angular, como componentes standalone, inyección de dependencias o módulos, con ejemplos acotados.
- Generación de documentación técnica: redactar READMEs, comentarios y descripciones de componentes Angular a partir de fragmentos de código, revisando la exactitud.
- Prototipado de pruebas: generar esqueletos de pruebas Jasmine/Karma para componentes y servicios; no sustituye la ejecución real de la suite de tests.
- Revisión de código asistida: analizar diffs de Angular y sugerir mejoras; sin tool calling nativo documentado, la integración requiere scripts externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para el modelo base, no confirmada por el autor: unos 3 GB en FP16, 1,5-2 GB en 8 bits y 0,8-1,2 GB en 4 bits, sin contar KV cache ni sobrecarga del runtime. El adaptador añade un coste mínimo.
- Apple Silicon: Mac con M1/M2/M3/M4 y al menos 8 GB de memoria unificada; 16 GB recomendados para trabajar con contexto amplio y otras aplicaciones abiertas.
- GPU NVIDIA: si se fusiona y convierte el modelo, una RTX 3060 de 6 GB o una RTX 4060 de 8 GB pueden bastar en 4 u 8 bits; una RTX 4090 o A100 no son necesarias para 1,5B en FP16. Esta vía no está documentada para este adaptador MLX.
- Despliegue documentado: mlx-lm sobre macOS con Apple Silicon. vLLM, TGI, llama.cpp y Ollama no están soportados de forma nativa para este adaptador sin fusión y conversión, y no se ha publicado una receta para ello.
- Latencia y throughput: no disponibles. Dependen del chip Apple, de la cuantización y de la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| angular-coder-1.5b-lora (este) | 1,5B en el base + adaptador | No disponible | No disponible | Apache-2.0 | Hugging Face; requiere modelo base y mlx-lm |
| Qwen2.5-Coder-1.5B-Instruct | 1,5B | No disponible | No disponible | Apache-2.0 | Hugging Face; modelo base generalista |
| bharathmuppa/angular-coder-1.5b | 1,5B | No disponible | No disponible | No disponible | Hugging Face; versión fusionada citada en la card |
| Qwen2.5-Coder-7B-Instruct | 7B | No disponible | No disponible | Apache-2.0 | Hugging Face; mayor capacidad y más requisitos de memoria |

No se dispone de benchmarks para comparar rendimiento; la comparativa es estructural y se basa en la información disponible.

## Limitaciones y advertencias

- Adaptador no autónomo: requiere descargar Qwen2.5-Coder-1.5B-Instruct y mlx-lm; no funciona como checkpoint completo.
- Compatibilidad limitada a MLX/Apple Silicon en la vía documentada; no hay GGUF, Ollama, vLLM ni TGI publicados.
- Sin datos de entrenamiento ni evaluación: no se puede verificar la mejora real en Angular ni medir regresiones frente al modelo base.
- Riesgo de alucinación en APIs y versiones de Angular; el ejemplo sobre Angular 20 no garantiza conocimiento actualizado.
- Contexto e idiomas no documentados; el rendimiento multilingüe es desconocido.
- Un modelo de 1,5B puede fallar en tareas complejas de arquitectura, migraciones grandes o razonamiento multi-paso.
- La licencia Apache-2.0 permite uso comercial, pero deben verificarse los términos del modelo base y de los datos de entrenamiento, que no se detallan.
- Sin validación de la comunidad: 0 descargas y 0 likes en el momento de la consulta.
- Si se fusiona con el modelo base, el tamaño y los requisitos pasan a ser los del checkpoint completo de 1,5B, no los 0,1 GB del adaptador.
- No hay información sobre sesgos, safety tuning o filtros de contenido específicos del adaptador.

## Enlaces

- Adaptador en Hugging Face: https://huggingface.co/bharathmuppa/angular-coder-1.5b-lora
- Modelo fusionado citado en la card: https://huggingface.co/bharathmuppa/angular-coder-1.5b
- Modelo base Qwen2.5-Coder-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Herramienta de despliegue mlx-lm: https://github.com/ml-explore/mlx-lm

No se han encontrado papers, blogs o demos adicionales en la información proporcionada.
