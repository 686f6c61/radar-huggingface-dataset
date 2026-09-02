# Snapkitty/pax-coder

## Resumen

PAX-Coder es un modelo de generación de código especializado en kernels GPU con verificación formal, desarrollado por Snapkitty (SNAPKITTYWEST). Se trata de un fine-tune del modelo DeepSeek-Coder-7B-Instruct que, además de generar código CUDA/PTX, produce una prueba Lean 4 comprobable por máquina que certifica la corrección del kernel. El modelo está orientado a entornos institucionales y de "sovereign compute" donde la integridad del código generado es crítica.

El modelo genera cuatro artefactos por cada petición: una prueba Lean 4, el ensamblador PTX para GPUs NVIDIA (sm_86 y sm_89), una especificación funcional en Futhark y un certificado PAX que clasifica la garantía de seguridad. Su arquitectura se basa en el transformer decoder-only de DeepSeek-Coder-7B, con 7 mil millones de parámetros (heredados del modelo base) y soporte únicamente para inglés.

La relevancia de PAX-Coder radica en su enfoque de "proof-carrying code": en lugar de confiar en la corrección del código generado, proporciona una certificación formal verificable por cualquier compilador Lean 4, lo que lo diferencia de otros generadores de código que solo producen código sin garantías.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (decoder-only), basado en DeepSeek-Coder-7B-Instruct |
| Parametros totales | 7B (heredados del modelo base) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés |
| Licencia | Sovereign Source License v2 (licencia propietaria) |
| Formato de pesos | No disponible (librería transformers) |

## Arquitectura y entrenamiento

PAX-Coder es un fine-tune del modelo DeepSeek-Coder-7B-Instruct, un transformer decoder-only con 7 mil millones de parámetros. El proceso de fine-tune no está documentado en detalle: no se especifican el número de tokens de entrenamiento, la composición del dataset ni si se utilizaron técnicas como RLHF o DPO. La model card indica que el modelo se entrenó para generar kernels GPU junto con pruebas Lean 4, especificaciones Futhark y certificados PAX, lo que sugiere un dataset especializado en verificación formal de código GPU.

La innovación principal no está en la arquitectura del modelo, sino en el pipeline de generación: el modelo produce simultáneamente código ejecutable (PTX) y una prueba formal de corrección en Lean 4, que puede ser verificada de forma independiente. El sistema se apoya en 10 Architecture Decision Records (ADR) que definen el modelo de seguridad, incluyendo la separación entre integridad pública y autorización, y un protocolo de verificación en dos fases (`verify-clone` y `verify-release`).

## Capacidades

- Generación de kernels GPU en CUDA/PTX para arquitecturas NVIDIA sm_86 (Ampere) y sm_89 (Ada).
- Generación de pruebas formales de corrección en Lean 4, comprobables por máquina.
- Generación de especificaciones funcionales en Futhark como referencia de verificación.
- Emisión de certificados PAX que clasifican la garantía de seguridad del código generado.
- Soporte de verificación formal integrada: el código y su prueba se generan en una sola pasada.
- Capacidad de generación de texto en inglés, especializada en dominios de programación de bajo nivel y verificación.

## Casos de uso

- Desarrollo de kernels CUDA verificados para entornos de alta integridad: PAX-Coder puede generar kernels para operaciones como softmax o multiplicación de matrices junto con su prueba Lean 4, lo que permite auditar la corrección sin depender de la revisión humana.
- Integración en pipelines de CI/CD para generación de código GPU con certificación formal: el modelo puede usarse en un flujo donde cada kernel generado se verifica automáticamente con Lean 4 antes de su despliegue.
- Documentación y trazabilidad de seguridad en sistemas de "sovereign compute": los certificados PAX y los ADR proporcionan un marco de gobernanza para entornos institucionales que requieren auditoría de código.
- Generación de especificaciones funcionales en Futhark para verificación cruzada: los desarrolladores pueden usar la salida Futhark como referencia para probar la equivalencia entre la especificación y la implementación PTX.
- Formación y educación en verificación formal de código GPU: el modelo puede servir como herramienta didáctica para aprender a escribir pruebas Lean 4 asociadas a kernels CUDA.
- Prototipado rápido de kernels GPU con garantías de corrección: en lugar de escribir el kernel y la prueba por separado, el modelo genera ambos artefactos de forma conjunta, reduciendo el tiempo de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- No se especifican requisitos de hardware en la documentación del modelo.
- Como referencia, un modelo de 7B parámetros en FP16 requiere aproximadamente 14 GB de VRAM para inferencia, pero este dato no está confirmado por el autor.
- El modelo está diseñado para generar código para GPUs NVIDIA sm_86 y sm_89, pero la inferencia del propio modelo puede ejecutarse en cualquier GPU compatible con transformers.
- Opciones de despliegue: se menciona compatibilidad con Ollama y la librería transformers de Python. No se mencionan vLLM, TGI ni llama.cpp.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos. Estructuralmente, PAX-Coder se basa en DeepSeek-Coder-7B-Instruct, por lo que comparte su arquitectura y tamaño. La diferencia principal frente a otros generadores de código (como CodeLlama-7B o StarCoder-7B) es la generación integrada de pruebas formales Lean 4, una capacidad que no está presente en esos modelos. Sin embargo, no hay benchmarks que permitan comparar la calidad del código generado.

## Limitaciones y advertencias

- La licencia Sovereign Source License v2 es una licencia propietaria no estándar; es necesario revisar sus términos antes de cualquier uso comercial.
- El modelo solo soporta inglés, lo que limita su uso en entornos multilingües.
- No se han publicado evaluaciones de sesgos o riesgos de alucinación. Dado que es un modelo especializado en código, puede generar código incorrecto o pruebas inválidas si la entrada es ambigua.
- La verificación formal con Lean 4 solo cubre los aspectos especificados en la prueba; no garantiza la corrección absoluta del kernel en todos los escenarios de ejecución.
- El modelo tiene 0 descargas y 0 likes en HuggingFace, lo que sugiere que es un proyecto reciente o poco validado por la comunidad.
- No se especifica la longitud de contexto, por lo que no se conocen los límites de entrada para prompts largos.
- El modelo está orientado a arquitecturas NVIDIA específicas (sm_86, sm_89); el código PTX generado puede no ser portable a otras GPUs.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Snapkitty/pax-coder)
- [Repositorio GitHub SNAPKITTYWEST/pax-coder](https://github.com/SNAPKITTYWEST/pax-coder)
- [MODEL_CARD.md en GitHub](https://github.com/SNAPKITTYWEST/pax-coder/blob/master/MODEL_CARD.md)
- [Perfil de SNAPKITTYWEST en HuggingFace](https://huggingface.co/SNAPKITTYWEST)
- [SnapKitty Downloads — Sovereign OS Ecosystem](https://collectivekitty.com/downloads)
- [Snapkitty/nvidia-stack](https://huggingface.co/Snapkitty/nvidia-stack)
- [Snapkitty/assembly-bite](https://huggingface.co/Snapkitty/assembly-bite)
- [Snapkitty/sov-kernel-monster](https://huggingface.co/Snapkitty/sov-kernel-monster)
