# Snapkitty/j-matrix-twin

## Resumen

J Matrix Twin es un proyecto publicado por Snapkitty en HuggingFace que se presenta como un mecanismo de atención alternativo para transformadores, basado en la instrucción SUBLEQ (un modelo de computación de una sola instrucción). En lugar de utilizar la función softmax en el cálculo de atención, propone un esquema de "subtract-and-branch" implementado en el lenguaje de programación J, con un playground interactivo en WebAssembly. El repositorio también menciona integración con un ledger WORM (write-once-read-many) en Nim y aritmética de campo de Goldilocks, orientado a compatibilidad con pruebas de conocimiento cero (ZK-SNARK).

No se trata de un modelo de lenguaje entrenado con pesos, sino de una implementación experimental de un mecanismo de atención. La información disponible no incluye arquitectura de red neuronal, parámetros, datos de entrenamiento, ni resultados de benchmarks. Por tanto, la ficha se limita a describir lo publicado y a señalar explícitamente los datos ausentes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el proyecto describe un mecanismo de atención SUBLEQ, no una arquitectura de red completa) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible (la insignia del README indica Apache 2.0, pero no se confirma en los metadatos de HuggingFace) |
| Formato de pesos | no disponible (no se distribuyen pesos; el proyecto es código fuente en J, Nim y JavaScript/WASM) |

## Arquitectura y entrenamiento

La documentación del proyecto describe un mecanismo de atención que sustituye la operación softmax por una secuencia de instrucciones SUBLEQ. En SUBLEQ, cada instrucción resta el contenido de una dirección de memoria A de otra B, almacena el resultado en B y, si el resultado es menor o igual a cero, salta a una dirección C; en caso contrario, continúa con la siguiente instrucción. El código mostrado en la model card implementa este paso en J.

No se proporciona información sobre una red neuronal completa, capas, normalización, ni sobre el proceso de entrenamiento. No se mencionan datos de entrenamiento, número de tokens, ni técnicas como RLHF o DPO. El proyecto parece ser un experimento de investigación sobre alternativas deterministas a softmax, con énfasis en eliminar exponenciales y operaciones en coma flotante, y en ser compatible con aritmética de campo finito (Goldilocks) para pruebas de conocimiento cero.

El repositorio incluye además un playground web en WebAssembly que permite ejecutar el código J sin necesidad de instalar el intérprete, y una integración con un ledger WORM en Nim para sellar resultados de operaciones matriciales.

## Capacidades

- Implementa un mecanismo de atención basado en SUBLEQ, que reemplaza softmax por operaciones de resta y salto condicional.
- Uso de programación tácita (point-free) en J para expresar transformaciones matriciales sin variables nombradas.
- Aritmética sobre el campo de Goldilocks, un primo de 64 bits usado en sistemas ZK-SNARK.
- Playground interactivo en WebAssembly accesible desde el navegador, sin dependencias externas.
- Integración con un ledger WORM en Nim para registrar resultados de forma inmutable y con verificación de integridad.
- No se documentan capacidades de generación de texto, razonamiento, código, visión, tool calling ni agentes, ya que no es un modelo de lenguaje completo.

## Casos de uso

Dado que el proyecto es un mecanismo de atención experimental y no un modelo de lenguaje entrenado, los casos de uso prácticos son limitados y se centran en investigación y prototipado:

- Investigación en mecanismos de atención alternativos: permite estudiar el comportamiento de SUBLEQ frente a softmax en tareas de aprendizaje automático, aunque no se han publicado resultados empíricos.
- Experimentación con aritmética de campo finito en atención: útil para explorar arquitecturas compatibles con pruebas de conocimiento cero.
- Educación sobre computación de una sola instrucción: sirve como ejemplo didáctico de cómo implementar atención con SUBLEQ.
- Prototipado de sistemas deterministas: al eliminar exponenciales, podría interesar en entornos donde se requiere determinismo estricto y ausencia de operaciones en coma flotante.
- Integración con ledgers inmutables: la funcionalidad WORM en Nim podría aplicarse a sistemas que necesiten registrar resultados de cómputo de forma auditable.
- Desarrollo de playgrounds en WebAssembly: el código del playground demuestra cómo ejecutar lógica J en el navegador, útil como referencia técnica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni ninguna otra métrica de evaluación. Tampoco se proporcionan mediciones de rendimiento, latencia o throughput.

## Requisitos de hardware

No disponible. Al no tratarse de un modelo con pesos, no se especifican requisitos de VRAM, GPUs recomendadas, ni opciones de despliegue como vLLM, llama.cpp u Ollama. El playground web funciona en el navegador y no requiere hardware especializado, pero no se documentan requisitos mínimos.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la misma categoría, ya que J Matrix Twin no es un modelo de lenguaje sino un mecanismo de atención experimental. No se puede comparar con alternativas como Llama, Mistral o Qwen.

## Limitaciones y advertencias

- Es un proyecto experimental sin validación empírica publicada; no se han demostrado ventajas frente a softmax en tareas reales.
- No se distribuyen pesos ni un modelo entrenado; solo código fuente y un playground.
- La licencia no está confirmada en los metadatos de HuggingFace; la insignia del README sugiere Apache 2.0, pero debe verificarse en el repositorio oficial.
- No hay información sobre sesgos, alucinaciones o riesgos de seguridad, al no ser un modelo generativo.
- El proyecto parece orientado a investigación y no está listo para producción como sistema de IA.
- No se especifican idiomas soportados ni capacidades multilingües.

## Enlaces

- HuggingFace: https://huggingface.co/Snapkitty/j-matrix-twin
- Repositorio GitHub (referenciado en la model card): https://github.com/SNAPKITTYWEST/j-matrix-twin
- Playground (referenciado en la model card): https://snapkittywest.github.io/j-matrix-twin/playground/public/
