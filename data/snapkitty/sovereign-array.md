# Snapkitty/sovereign-array

## Resumen

Snapkitty/sovereign-array no es un modelo de lenguaje ni un sistema de IA generativa, sino un proyecto de lenguaje de programación array formalizado en Lean 4. Lo desarrolla el autor Snapkitty (también conocido como SNAPKITTYWEST) como parte de un ecosistema más amplio denominado "Sovereign OS", que incluye otros componentes como un compilador XML. El proyecto parte de una revisión arquitectónica de la propuesta "Unimath Array", conservando los isomorfismos considerados válidos y descartando lo que el autor denomina "conflaciones fatales" (como "univalence replaces SIMD" o "NP-magic").

El repositorio contiene una formalización Lean 4 de operadores de arrays (broadcasting, NAND attention, SimplexNorm y softmax), una implementación de referencia en Python y una suite de pruebas basada en propiedades. No se trata de un modelo entrenado con pesos, sino de un artefacto de código fuente y especificaciones formales. A fecha de creación (septiembre de 2026), no tiene descargas ni likes en Hugging Face, y su licencia es "sovereign-source-license-v2", una licencia no estándar que restringe el uso comercial sin autorización explícita.

La relevancia actual del proyecto reside en su enfoque de verificación formal aplicada a operaciones de arrays, un área de interés creciente para sistemas de cómputo soberano y para la validación matemática de primitivas de bajo nivel. Sin embargo, no es un modelo usable desde transformers ni ofrece capacidades de generación de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (no es un modelo de IA; es un proyecto de lenguaje array formalizado en Lean 4) |
| Parametros totales | No disponible |
| Parametros activos | No disponible (no es un MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (documentacion y codigo) |
| Licencia | sovereign-source-license-v2 (licencia no estandar, uso comercial restringido) |
| Formato de pesos | No aplica (es codigo fuente Lean 4 y Python) |

## Arquitectura y entrenamiento

El proyecto no sigue una arquitectura de red neuronal ni ha sido entrenado con datos. Segun la model card, se trata de una "formalizacion Lean 4 de array broadcasting, NAND attention, SimplexNorm y softmax operators". La arquitectura del lenguaje array se describe como derivada de una revision de la propuesta Unimath Array, de la que se conservan los isomorfismos considerados validos y se descartan las "conflaciones fatales". No hay informacion sobre tokens de entrenamiento, dataset, ni procesos de RLHF/DPO. Los elementos tecnicos destacables son la implementacion en Lean 4 (un asistente de pruebas y lenguaje de programacion dependientemente tipado) y una suite de verificacion en cuatro capas ("four-layer falsification suite") mencionada en los commits recientes.

## Capacidades

- Formalizacion matematica de operadores de arrays en Lean 4, incluyendo broadcasting, NAND attention, SimplexNorm y softmax.
- Implementacion de referencia en Python para validacion y experimentacion.
- Suite de pruebas basada en propiedades (property-based testing) para verificar invariantes.
- Capacidad de verificacion formal: al estar escrito en Lean 4, permite demostrar teoremas sobre las operaciones definidas.
- No ofrece generacion de texto, razonamiento, codigo, vision, tool calling, ni capacidades de agente.
- No es un modelo de lenguaje multilingue; la documentacion y el codigo estan en ingles.

## Casos de uso

- Verificacion formal de primitivas de computo numerico: el proyecto permite demostrar propiedades de operaciones de arrays (broadcasting, softmax) usando Lean 4, lo que es util para sistemas donde se requiere garantia matematica de correccion (por ejemplo, en finanzas, aeroespacial o criptografia).
- Desarrollo de lenguajes de programacion array: sirve como punto de partida o referencia para quien quiera disenar un lenguaje de arrays con bases formalizadas.
- Auditoria de propuestas arquitectonicas: el proyecto documenta una revision critica de la propuesta Unimath Array, util para investigadores que evaluen dicha propuesta.
- Ensenanza de Lean 4: el codigo puede usarse como material didactico para aprender demostracion interactiva de teoremas sobre operaciones numericas.
- Base para un compilador o runtime de arrays: la implementacion Python y la formalizacion pueden servir para construir un interprete o compilador de un lenguaje array especifico.
- Integracion en sistemas de computo soberano: dentro del ecosistema Sovereign OS, este proyecto podria usarse como componente de bajo nivel para operaciones de arrays verificadas, aunque no hay documentacion publica de como integrarlo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El proyecto no incluye metricas de rendimiento de inferencia ni comparaciones con otros sistemas.

## Requisitos de hardware

- No requiere GPU ni hardware especializado para ejecutar el codigo Lean 4 o Python; basta con un ordenador estandar con Lean 4 y Python instalados.
- Para compilar y verificar el codigo Lean 4 se recomienda al menos 8 GB de RAM y un procesador moderno, aunque proyectos Lean de tamano moderado pueden funcionar con menos.
- No hay opciones de despliegue como vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- La implementacion Python puede ejecutarse en cualquier entorno con Python 3.8 o superior.

## Comparativa con modelos similares

No disponible. No es un modelo de IA comparable con otros modelos de lenguaje o de generacion. Como proyecto de lenguaje formal, podria compararse con otras formalizaciones Lean de operaciones numericas (por ejemplo, las de mathlib), pero no hay informacion suficiente en la documentacion proporcionada para establecer una comparativa rigurosa.

## Limitaciones y advertencias

- No es un modelo de IA: no puede generar texto, razonar ni ejecutar tareas de lenguaje natural.
- Licencia restrictiva: la "sovereign-source-license-v2" es una licencia no estandar que probablemente limita el uso comercial y la redistribucion sin permiso explicito del autor. Antes de usar el codigo en produccion, es imprescindible consultar los terminos exactos de la licencia en el repositorio.
- Documentacion escasa: no se proporciona informacion detallada sobre la sintaxis del lenguaje, la semantica de los operadores ni ejemplos de uso completos.
- Estado del proyecto: con cero descargas y cero likes en Hugging Face, es un proyecto muy reciente y sin validacion de la comunidad.
- Riesgo de sesgos: al ser codigo formal, no aplican sesgos de lenguaje, pero si puede haber errores de diseno no detectados en la formalizacion.
- Sin soporte para produccion: no hay guia de despliegue, ni versiones estables, ni mantenimiento documentado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Snapkitty/sovereign-array
- Dataset asociado en Hugging Face: https://huggingface.co/datasets/Snapkitty/sovereign-array
- Repositorio en GitHub: https://github.com/SNAPKITTYWEST/sovereign-array
- Perfil de GitHub del autor: https://github.com/SNAPKITTYWEST
- Proyecto relacionado (sovereign-xml-compiler): https://huggingface.co/Snapkitty/sovereign-xml-compiler
