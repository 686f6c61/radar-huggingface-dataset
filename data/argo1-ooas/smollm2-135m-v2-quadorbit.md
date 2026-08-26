# Argo1-OOAS/SmolLM2-135M-V2-QuadOrbit

## Resumen

SmolLM2-135M-V2-QuadOrbit es un checkpoint de investigación desarrollado por Argo1-OOAS que adapta el modelo base HuggingFaceTB/SmolLM2-135M-Instruct mediante una rama auxiliar denominada QuadOrbit. La propuesta técnica consiste en mantener congelado el núcleo Transformer de SmolLM2 (30 capas, ancho 576) y entrenar únicamente una rama de contexto de 424.641 parámetros. En inferencia, el usuario selecciona un *trigger* que activa esta rama y puede alterar un número configurable de distribuciones de tokens subsiguientes.

El modelo está pensado como un experimento de arquitectura condicionada por disparadores, no como un asistente de propósito general. Su ventana de contexto es de 8.192 tokens y su vocabulario de 49.152 entradas. La licencia es Apache-2.0 y el idioma de trabajo es el inglés. Con 0 descargas y 0 likes en el momento de esta ficha, se trata de un proyecto incipiente orientado a la comunidad investigadora.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (SmolLM2) con rama QuadOrbit condicionada por trigger |
| Parametros totales | 163.251.200 (según safetensors); 134.939.649 únicos declarados en la model card |
| Parametros activos | No aplica (no es MoE); rama entrenada: 424.641 |
| Longitud de contexto | 8.192 |
| Tipos de cuantizacion | No disponible (repositorio sin archivos GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | Inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (PyTorch) |

## Arquitectura y entrenamiento

La arquitectura parte del modelo SmolLM2-135M-Instruct de HuggingFace, con 30 capas y un ancho de 576. La innovación técnica es la rama QuadOrbit, un módulo condicionado por un trigger que se activa durante la inferencia y modifica las distribuciones de un número configurable de tokens siguientes. El entrenamiento se realiza sobre el dataset HuggingFaceTB/smol-smoltalk, con 2.000 actualizaciones de la rama y un total de 262.144.000 presentaciones de token. La pérdida de validación terminal estimada es de 1,6958 (PPL 5,5), medida sobre una muestra de diez lotes del flujo de validación local de SmolTalk; no es un benchmark estandarizado. El modelo no modifica pesos durante el prompting: el contexto condiciona la rama, pero no la actualiza.

## Capacidades

- Generación de texto condicionada por un trigger seleccionado por el usuario.
- Control granular sobre el número de tokens siguientes cuya distribución se ve alterada por el trigger.
- Condicionamiento contextual opcional que privaciza la rama sin modificar los pesos.
- Auditoría de tokens en la interfaz de comparación incluida en el repositorio fuente.
- Capacidades multilingües limitadas al inglés (único idioma declarado).
- No soporta tool calling, agentes, visión ni razonamiento multi-paso.

## Casos de uso

- **Investigación académica sobre adaptación condicionada**: el modelo permite estudiar cómo un trigger específico puede alterar la generación de texto sin reentrenar el modelo base, útil para experimentos de control fino de comportamiento.
- **Experimentación con condicionamiento por contexto**: se puede usar como banco de pruebas para evaluar si un contexto adicional modifica la salida de la rama QuadOrbit en tareas de generación corta.
- **Desarrollo de interfaces de comparación de modelos**: el repositorio fuente incluye una interfaz de chat para comparar el comportamiento del modelo con otros checkpoints, útil para docencia y demostraciones.
- **Estudio de alucinación y repetición en modelos pequeños**: su naturaleza experimental permite analizar fallos de repetición y pérdida de fluidez a alta guidance, un caso de estudio para técnicas de mitigación.
- **Entrenamiento de ramas auxiliares sobre modelos congelados**: sirve como ejemplo de implementación de una arquitectura híbrida congelada y rama entrenable, reutilizable en proyectos de investigación.
- **Demostración de inferencia en dispositivos de bajos recursos**: con 163 millones de parámetros, el modelo puede ejecutarse en CPU o GPUs de baja gama, ideal para demostraciones educativas de generación de texto sin dependencias de hardware avanzado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica declarada es la pérdida de validación terminal de 1,6958 (PPL 5,5) sobre una muestra local de SmolTalk, que no es comparable con otras métricas estandarizadas como MMLU o HumanEval.

## Requisitos de hardware

- **VRAM estimada para inferencia**: aproximadamente 0,7 GB en fp32 (163 millones de parámetros), por lo que cabe en cualquier GPU moderna con al menos 1 GB de VRAM.
- **GPU recomendadas**: RTX 3060, RTX 4060, o incluso GPUs integradas de gama baja. También ejecutable en CPU sin problemas.
- **Compatibilidad con consumer GPU**: sí, funciona en cualquier GPU de consumo y en CPU.
- **Opciones de despliegue**: el repositorio fuente incluye una interfaz de chat propia; se puede usar con PyTorch estándar. No se publican pesos en formato GGUF, por lo que no es compatible directamente con llama.cpp u Ollama. vLLM no es necesario para este tamaño.
- **Latencia y throughput**: no disponible en la información proporcionada; en CPU se esperan latencias de decenas de milisegundos por token, y en GPU de pocos milisegundos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Argo1-OOAS/SmolLM2-135M-V2-QuadOrbit | 163M | 8.192 | Apache-2.0 | Rama QuadOrbit condicionada por trigger; experimental |
| HuggingFaceTB/SmolLM2-135M-Instruct | 135M | 8.192 | Apache-2.0 | Modelo base, sin rama adicional, más estable |
| HuggingFaceTB/SmolLM2-360M | 360M | 8.192 | Apache-2.0 | Mayor capacidad, mejor rendimiento en tareas generales |

La comparativa se limita a la familia SmolLM2, dado que no se han publicado benchmarks estandarizados para este checkpoint. El modelo QuadOrbit no ofrece ventajas de rendimiento sobre su base instructiva, sino que introduce un mecanismo experimental de condicionamiento.

## Limitaciones y advertencias

- **Modelo experimental**: no es un asistente fiable; la model card advierte que puede repetir, alucinar, ignorar el contexto añadido o perder fluidez a altas guidance.
- **Idioma limitado**: solo soporta inglés; no hay capacidades multilingües.
- **Riesgo de alucinación**: inherente a modelos pequeños y agravado por el mecanismo de trigger.
- **Sin benchmarks estandarizados**: no se ha evaluado en MMLU, HumanEval ni otras métricas conocidas, lo que impide una comparación objetiva.
- **Restricciones de licencia**: Apache-2.0 permite uso comercial, pero el modelo no es apto para decisiones de alto impacto (médicas, legales, financieras).
- **Falta de cuantizaciones**: no se proporcionan pesos GGUF ni cuantizaciones, lo que limita el despliegue en entornos con restricciones de memoria.
- **Código no estándar**: el repositorio usa código PyTorch propio, no Transformers `AutoModel`; se recomienda revisar el código antes de ejecutarlo.

## Enlaces

- [HuggingFace: Argo1-OOAS/SmolLM2-135M-V2-QuadOrbit](https://huggingface.co/Argo1-OOAS/SmolLM2-135M-V2-QuadOrbit)
- [Modelo base: HuggingFaceTB/SmolLM2-135M-Instruct](https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct)
- [Modelo base: HuggingFaceTB/SmolLM2-135M](https://huggingface.co/HuggingFaceTB/SmolLM2-135M)
- [Dataset: HuggingFaceTB/smol-smoltalk](https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk)
- [Documento de investigación (research_pdf.pdf)](https://huggingface.co/Argo1-OOAS/SmolLM2-135M-V2-QuadOrbit/blob/main/research_pdf.pdf)
- [Repositorio fuente del código (referenciado en la model card)](https://huggingface.co/Argo1-OOAS/SmolLM2-135M-V2-QuadOrbit/tree/main)
