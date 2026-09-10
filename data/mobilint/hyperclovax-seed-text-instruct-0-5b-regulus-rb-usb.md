# mobilint/HyperCLOVAX-SEED-Text-Instruct-0.5B-regulus-rb-usb

## Resumen

HyperCLOVAX-SEED-Text-Instruct-0.5B-regulus-rb-usb es una adaptación publicada por la empresa surcoreana Mobilint sobre el modelo base naver-hyperclovax/HyperCLOVAX-SEED-Text-Instruct-0.5B, un transformer decoder-only de aproximadamente 0,5 mil millones de parámetros desarrollado por Naver. El sufijo "regulus-rb-usb" apunta a un artefacto empaquetado para el acelerador NPU Regulus de Mobilint en formato USB, y la etiqueta base_model:quantized indica que los pesos derivan de una versión cuantizada del modelo original.

El modelo se distribuye como un repositorio de pesos en safetensors con código personalizado (custom_code) y arquitectura declarada como mobilint-llama, lo que implica que la carga requiere confiar en código remoto y probablemente el stack de software de Mobilint en lugar de un runtime estándar. Está orientado a generación de texto conversacional (pipeline text-generation) en escenarios de inferencia ligera sobre hardware de borde.

La relevancia de esta ficha es acotada: el repositorio no incluye tarjeta de modelo con especificaciones, no declara idiomas ni licencia concreta y registra cero descargas y cero "likes" en el momento de la consulta. La búsqueda web realizada no arrojó ninguna documentación técnica sobre este artefacto, por lo que buena parte de los campos siguientes quedan marcados como "no disponible" y deben verificarse contra el repositorio del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, declarada por el autor como mobilint-llama con custom_code; el detalle interno no está publicado en la información disponible |
| Parámetros totales | 0,5B (según el nombre del modelo; no confirmado en tarjeta) |
| Parámetros activos | No aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Derivado de una versión cuantizada del modelo base (etiqueta base_model:quantized); el esquema concreto (int8, int4, etc.) no está especificado |
| Idiomas soportados | no disponible (el modelo base de Naver está orientado a coreano e inglés, pero no se declara en este repositorio) |
| Licencia | no disponible; la etiqueta del repositorio indica license:other, por lo que se hereda la licencia del modelo base, no detallada aquí |
| Formato de pesos | safetensors con custom_code |
| Pipeline | text-generation |
| Autor | mobilint |
| Fecha de publicación | 2026-09-10 |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna, los datos de entrenamiento ni el proceso de alineación de este artefacto concreto. La etiqueta de arquitectura personalizada mobilint-llama sugiere una implementación de transformer decoder-only con atención causal, coherente con la familia LLaMA, y el tag custom_code implica que el repositorio incluye módulos Python propios que deben ejecutarse con trust_remote_code habilitado. No hay datos sobre número de tokens de entrenamiento, composición del dataset, ni si se aplicaron fases de RLHF, DPO o ajuste instruccional; el modelo base de Naver es un modelo "Instruct", por lo que la alineación instruccional proviene de ese origen y no se documenta aquí.

La única transformación técnica verificable es la cuantización y el empaquetado específico para el acelerador Regulus de Mobilint (variante USB, según el nombre). No hay información sobre si se aplicaron técnicas adicionales como decodificación especulativa, atención lineal, ni sobre el esquema de cuantización empleado.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es text-generation y el modelo base está ajustado para instrucciones, por lo que se espera soporte de diálogo multi-turno básico.
- Ajuste a instrucciones: heredado del modelo base "Instruct"; no hay evaluación publicada para esta variante.
- Razonamiento y matemáticas: no disponible; no hay benchmarks ni documentación que lo confirmen en esta versión.
- Generación de código: no disponible.
- Tool calling / function calling: no disponible; no se declara plantilla de herramientas ni soporte de llamadas a funciones.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; no se declara lista de idiomas en el repositorio.
- Capacidades especiales (modo thinking, visión, audio): no disponibles; el nombre indica "Text", por lo que no se espera soporte multimodal.
- Inferencia en hardware de borde: el empaquetado regulus-rb-usb está pensado para ejecución sobre el acelerador NPU Regulus de Mobilint vía USB, lo que constituye su capacidad diferencial frente a los pesos estándar del modelo base.

## Casos de uso

- Despliegue en dispositivos de borde con acelerador NPU: el artefacto está empaquetado para el acelerador Regulus USB, de modo que se usaría en equipos sin GPU dedicada que necesiten inferencia local de un modelo de 0,5B.
- Asistentes conversacionales embebidos: con 0,5B de parámetros, encaja en aplicaciones de diálogo sencillo con presupuesto de memoria muy reducido, siempre que el contexto necesario sea corto.
- Clasificación y extracción de información ligera: tareas de etiquetado, resumen de frases cortas o extracción de campos en un pipeline local de bajo coste.
- Prototipado y pruebas de integración del stack Mobilint: sirve para validar la cadena de herramientas (compilación, carga de custom_code, ejecución sobre NPU) antes de escalar a modelos mayores.
- Filtrado y preprocesado previo a un modelo mayor: generar borradores, normalizar texto o responder consultas triviales para descargar a un modelo de mayor tamaño en una arquitectura en cascada.
- Investigación sobre cuantización y portabilidad: permite estudiar cómo se comporta un modelo de 0,5B tras cuantización y reempaquetado para hardware específico.
- Educación y demos offline: ejecución totalmente local y desconectada para demostraciones de generación de texto sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio de HuggingFace no incluye tabla de evaluaciones (MMLU, HumanEval, GSM8K ni otros), no se declara ninguna métrica de latencia o throughput, y la búsqueda web no devolvió documentación técnica asociada a este artefacto.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16, aproximadamente 1 GB solo para pesos (0,5B × 2 bytes), más overhead de activaciones y caché KV; en int8, alrededor de 0,5 GB de pesos. Son estimaciones a partir del recuento de parámetros, no cifras publicadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar los pesos en fp16 con margen; no hay requisitos publicados para la ruta específica de Mobilint.
- GPU de consumo: cabe con holgura en GTX 1650, RTX 3050, RTX 4060 y superiores; también en iGPU con memoria unificada suficiente si el runtime lo permite.
- Acelerador específico: el nombre del repositorio indica soporte para el NPU Regulus de Mobilint en formato USB, lo que implica que la ruta prevista no es una GPU convencional sino ese acelerador, con su propio runtime.
- Opciones de despliegue: al declarar custom_code y una arquitectura mobilint-llama, es probable que la carga requiera trust_remote_code y el stack de Mobilint; no hay confirmación de compatibilidad con vLLM, TGI, llama.cpp u Ollama. Cualquier uso con esos runtimes debería verificarse empíricamente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| HyperCLOVAX-SEED-Text-Instruct-0.5B-regulus-rb-usb (este) | 0,5B | no disponible | no disponible (license:other) | Repositorio HuggingFace con 0 descargas | Empaquetado para NPU Regulus; requiere custom_code |
| naver-hyperclovax/HyperCLOVAX-SEED-Text-Instruct-0.5B (modelo base) | 0,5B | no disponible en esta ficha | la del modelo base de Naver, no detallada aquí | Repositorio público de Naver | Pesos originales sin reempaquetar; es el punto de partida de esta variante |
| Qwen2.5-0.5B-Instruct | 0,49B | 32.768 tokens | Apache 2.0 | Muy extendido en HuggingFace | Alternativa de propósito general con formato estándar y amplio soporte de runtimes |
| SmolLM2-360M-Instruct | 0,36B | 8.192 tokens | Apache 2.0 | Ampliamente disponible | Alternativa aún más pequeña, orientada a dispositivos de borde con runtimes convencionales |

La comparación de rendimiento con estas alternativas no puede realizarse: no hay métricas publicadas para el modelo de Mobilint y, por tanto, no procede establecer rankings.

## Limitaciones y advertencias

- Ausencia total de documentación: el repositorio no incluye tarjeta de modelo, ni descripción de datos, ni limitaciones declaradas por el autor.
- Licencia sin concretar: la etiqueta license:other y la ausencia de texto de licencia impiden determinar si el uso comercial está permitido; el modelo base de Naver tiene sus propias condiciones, que deben revisarse antes de cualquier despliegue productivo.
- Riesgo de alucinación: con 0,5B de parámetros, la tasa de errores factuales y de invención de datos es intrínsecamente elevada; no apto para tareas que exijan precisión factual sin verificación posterior.
- Contexto limitado: la ventana de contexto no está publicada, y en modelos de este tamaño suele ser corta, lo que restringe conversaciones largas o documentos extensos.
- Idiomas no declarados: no se especifica cobertura multilingüe; el rendimiento en castellano es indeterminado y, si el modelo base está centrado en coreano e inglés, el comportamiento en otros idiomas puede degradarse notablemente.
- Dependencia de código personalizado: la etiqueta custom_code implica ejecutar código remoto al cargar el modelo, lo que introduce un riesgo de seguridad y de compatibilidad; conviene auditar los archivos del repositorio antes de usarlos.
- Dependencia de hardware propietario: el empaquetado regulus-rb-usb está atado al acelerador Regulus de Mobilint; fuera de ese hardware el artefacto puede no ser directamente utilizable.
- Madurez nula: cero descargas y cero interacciones, sin historial de uso ni validación por parte de la comunidad.
- Sin métricas de producción: no hay datos de latencia, throughput ni consumo energético que permitan planificar un despliegue real.
- Verificación pendiente: todos los campos marcados como "no disponible" deberían contrastarse con el repositorio del modelo base y con la documentación de Mobilint antes de tomar decisiones técnicas.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/mobilint/HyperCLOVAX-SEED-Text-Instruct-0.5B-regulus-rb-usb
- Modelo base en HuggingFace: https://huggingface.co/naver-hyperclovax/HyperCLOVAX-SEED-Text-Instruct-0.5B
- Perfil del autor en HuggingFace: https://huggingface.co/mobilint
- Paper, blog, repositorio de código o demo: no disponible; la búsqueda web realizada no devolvió resultados técnicos relacionados con este modelo (los resultados obtenidos correspondían a bisagras de 270 grados y no guardan relación con el artefacto).
