# CogniMary/CogniMary

## Resumen

CogniMary es un modelo publicado en Hugging Face bajo el identificador `CogniMary/CogniMary` por el usuario del mismo nombre. La model card asociada es prácticamente vacía: únicamente declara la licencia MIT y no incluye descripción, arquitectura, datos de entrenamiento ni instrucciones de uso. El repositorio no registra descargas ni interacciones en el momento de la consulta, lo que sugiere una publicación reciente o sin difusión.

No se dispone de información sobre arquitectura, número de parámetros, longitud de contexto ni modalidades soportadas. Tampoco se especifican los idiomas ni el pipeline de inferencia, por lo que no es posible clasificarlo con rigor dentro de una categoría concreta (LLM, modelo de visión, embeddings, etc.). Cualquier evaluación funcional requeriría inspeccionar directamente los archivos del repositorio.

Dada la ausencia de documentación, esta ficha se limita a recoger los metadatos verificables y a señalar explícitamente los datos no disponibles, sin inferir características que el autor no haya declarado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo (transformer, MoE, SSM, híbrida u otra), ni sobre el volumen o composición de los datos de entrenamiento, ni sobre posibles fases de ajuste fino supervisado, RLHF o DPO. La model card no incluye detalles técnicos ni referencias a papers o documentación adicional.

Tampoco se documentan innovaciones técnicas como decodificación especulativa, atención lineal o modos de razonamiento extendido. Sin acceso a los archivos de pesos o a la configuración del modelo, no es posible determinar estos aspectos.

## Capacidades

- No se han documentado capacidades específicas en la información disponible.
- No consta soporte de tool calling ni function calling.
- No consta soporte para flujos de agentes o razonamiento multi-paso.
- No se especifican capacidades multilingües.
- No se declaran capacidades especiales (modo thinking, visión, audio, etc.).

## Casos de uso

- Evaluación exploratoria: clonar el repositorio y cargar los pesos en un entorno aislado para determinar empíricamente la tarea para la que fue entrenado el modelo.
- Prototipado interno: usar el modelo como base de pruebas en un entorno controlado, asumiendo que su comportamiento no está documentado y requiere validación manual.
- Investigación de reproducibilidad: analizar los archivos del repositorio para estudiar cómo se publican modelos sin model card y qué riesgos conlleva para la comunidad.
- Integración condicionada a auditoría: solo tras verificar el formato de pesos, la tokenización y el comportamiento del modelo podría plantearse su uso en un pipeline, siempre con tests de regresión propios.
- Docencia y formación: emplearlo como ejemplo de repositorio incompleto para enseñar buenas prácticas de publicación de modelos en Hugging Face.
- Benchmarking comparativo: incluirlo como referencia en experimentos que midan la calidad de la documentación y la facilidad de adopción de modelos open source.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (depende del tamaño del modelo, que no se ha declarado).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; requeriría conocer primero el formato de pesos y la arquitectura.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No es posible establecer una comparativa fiable porque se desconocen el tamaño, la arquitectura y la tarea del modelo. No se identifican alternativas comparables en la información disponible.

| Modelo | Parámetros | Contexto | Licencia | Documentación |
|---|---|---|---|---|
| CogniMary | no disponible | no disponible | MIT | model card vacía |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de model card: no hay información sobre entrenamiento, datos, sesgos o comportamiento esperado.
- Riesgo elevado de alucinación y comportamiento impredecible al no conocerse la naturaleza del modelo.
- Imposibilidad de verificar sesgos conocidos sin documentación ni evaluación empírica.
- No se especifican limitaciones de contexto ni de idioma.
- La licencia MIT permite uso comercial, pero la falta de documentación impide evaluar riesgos de propiedad intelectual sobre los datos de entrenamiento.
- No apto para producción sin una auditoría previa completa (formato de pesos, tokenizador, pruebas de comportamiento y seguridad).
- Cero descargas y cero likes: sin validación por parte de la comunidad.

## Enlaces

- [Hugging Face: CogniMary/CogniMary](https://huggingface.co/CogniMary/CogniMary)
