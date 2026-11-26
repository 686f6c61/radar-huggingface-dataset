# mradermacher/Gobble-Prover-1.7B-GGUF

## Resumen

Gobble-Prover-1.7B es un modelo de lenguaje especializado en demostración automática de teoremas sobre Lean 4, desarrollado por el equipo anónimo `anonymous-submission-naacl` (probablemente vinculado a un envío a NAACL). El modelo base tiene 2.031.739.904 parámetros y está pensado para asistir en la construcción de pruebas formales, una tarea que requiere razonamiento simbólico riguroso y conocimiento del lenguaje de tácticas de Lean.

La versión que nos ocupa es la cuantización GGUF realizada por mradermacher, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles. Se ofrecen 11 variantes de cuantización estática (desde Q2_K hasta f16), lo que facilita el despliegue local en entornos con recursos limitados.

Su relevancia actual radica en la creciente demanda de asistentes de prueba formales para verificación de software y matemáticas, un nicho donde los modelos pequeños especializados pueden ser más prácticos que los modelos generalistas de gran tamaño. La licencia Apache 2.0 y el formato GGUF lo hacen accesible para experimentación e integración en pipelines de verificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer, inferido por el uso de transformers y GGUF) |
| Parametros totales | 2.031.739.904 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base en la documentación proporcionada. Por el uso de la librería `transformers` y la presencia de pesos en safetensors, se trata de un transformer decoder-only estándar. El tamaño de 2.031.739.904 parámetros corresponde a un modelo de aproximadamente 1.7B parámetros nominales, con un vocabulario y embeddings que elevan el total.

Los datos de entrenamiento no están disponibles: no se especifica el número de tokens, la composición del dataset ni si se aplicaron técnicas de RLHF, DPO o supervisión con demostraciones de Lean 4. La etiqueta `lean4` y `theorem-proving` sugiere un ajuste fino sobre corpus de código Lean y posiblemente pares de estados de prueba y tácticas. No se han documentado innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto especializada en el dominio de demostración de teoremas formales.
- Generación de tácticas y scripts de Lean 4 para completar pruebas.
- Razonamiento simbólico orientado a la construcción de demostraciones paso a paso.
- Soporte conversacional (etiqueta `conversational`), lo que permite interacción multi-turno.
- Compatible con endpoints de inferencia (etiqueta `endpoints_compatible`).
- Capacidades multilingües limitadas al inglés.
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio.

## Casos de uso

- Asistencia en la formalización de matemáticas en Lean 4: el modelo puede proponer tácticas (`simp`, `rw`, `induction`, etc.) a partir de un estado de prueba dado, acelerando el trabajo de investigadores que traducen demostraciones en papel a código verificable.
- Autocompletado de pruebas en editores: integrado mediante llama.cpp u Ollama, puede ofrecer sugerencias de tácticas en tiempo real dentro de un IDE mientras el usuario escribe una demostración, reduciendo la fricción del flujo de trabajo.
- Generación de lemas auxiliares: dado un objetivo complejo, el modelo puede proponer lemas intermedios que faciliten la prueba principal, un patrón habitual en el desarrollo de bibliotecas como Mathlib.
- Docencia de lógica y teoría de tipos: sirve como herramienta interactiva para que estudiantes exploren cómo se construyen demostraciones formales, con la ventaja de ejecutarse localmente sin depender de APIs externas.
- Verificación de código crítico: en pipelines de verificación de software, puede asistir en la generación de invariantes y obligaciones de prueba que luego se validan con el compilador de Lean.
- Experimentación en investigación sobre theorem proving: al ser un modelo pequeño y con licencia permisiva, es adecuado como baseline en experimentos de generación de pruebas, búsqueda guiada y fine-tuning sobre dominios específicos.
- Prototipado de asistentes conversacionales para matemáticas formales: su naturaleza conversacional permite construir interfaces de chat que guíen al usuario en la construcción de pruebas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1.0 GB (Q2_K), 1.4 GB (Q4_K_M), 2.3 GB (Q8_0) y 4.2 GB (f16), según los tamaños de archivo indicados en la model card.
- GPU recomendadas: cualquier GPU consumer con al menos 2-4 GB de VRAM para cuantizaciones bajas; RTX 3060, RTX 4060 o superiores para cuantizaciones altas con contexto amplio.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPUs modernas, e incluso en CPU mediante llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base es compatible con `transformers` y endpoints de inferencia.
- Latencia y throughput: no disponibles. Por el tamaño (1.7B) y las cuantizaciones Q4, se espera una latencia baja en GPU consumer, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia | Formato |
|---|---|---|---|---|---|
| Gobble-Prover-1.7B | 2.03B | no disponible | Lean 4 / theorem proving | Apache 2.0 | GGUF, safetensors |
| DeepSeek-Prover (familia) | 1.3B–7B | no disponible | Lean 4 / theorem proving | varía según versión | safetensors |
| LeanDojo / ReProver | ~300M–1B | no disponible | Lean / retrieval-augmented | varía | safetensors |
| Modelos generalistas 1.7B (p. ej. Qwen2.5-1.5B) | ~1.5B | 32K típicamente | propósito general | Apache 2.0 | GGUF, safetensors |

La comparación cuantitativa de rendimiento no está disponible al no publicarse benchmarks. La ventaja principal de Gobble-Prover-1.7B frente a modelos generalistas es su especialización en Lean 4; frente a otros prover modelos, su disponibilidad en GGUF con múltiples cuantizaciones facilita el despliegue local.

## Limitaciones y advertencias

- El modelo solo soporta inglés, lo que limita su uso en entornos hispanohablantes sin traducción previa.
- Riesgo de alucinación en la generación de tácticas: puede producir comandos de Lean 4 sintácticamente válidos pero semánticamente incorrectos o no aplicables al estado de prueba.
- No se han publicado datos sobre sesgos; al estar entrenado presumiblemente sobre corpus de Lean/Mathlib, puede reflejar los sesgos de esas bibliotecas y de sus contribuyentes.
- Longitud de contexto no documentada: no se puede garantizar el manejo de estados de prueba muy extensos.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base es un envío anónimo a NAACL, lo que puede implicar restricciones adicionales no reflejadas en la model card.
- Es una cuantización estática: no se ofrecen versiones con imatrix/weighted, lo que puede suponer una pérdida de calidad mayor en cuantizaciones bajas (Q2_K, Q3_K_M) respecto a alternativas ponderadas.
- No se documenta soporte de tool calling ni de agentes, por lo que su integración en pipelines automatizados requiere envoltorios externos.
- El repositorio tiene 248 descargas y 0 likes, lo que indica una validación comunitaria muy limitada.

## Enlaces

- [Hugging Face: mradermacher/Gobble-Prover-1.7B-GGUF](https://huggingface.co/mradermacher/Gobble-Prover-1.7B-GGUF)
- [Modelo base: anonymous-submission-naacl/Gobble-Prover-1.7B](https://huggingface.co/anonymous-submission-naacl/Gobble-Prover-1.7B)
- [Página de descargas de mradermacher](https://hf.tst.eu/model#Gobble-Prover-1.7B-GGUF)
- [FAQ y solicitudes de cuantización de mradermacher](https://huggingface.co/mradermacher/model_requests)
- [Guía de uso de GGUF (README de TheBloke)](https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF)
- [Notas sobre cuantizaciones de Artefact2](https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9)
- [nethype GmbH](https://www.nethype.de/)
