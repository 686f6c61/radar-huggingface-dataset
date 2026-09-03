# Snapkitty/sovereign-pirtm

## Resumen

El repositorio `Snapkitty/sovereign-pirtm` no contiene un modelo de inteligencia artificial, sino el núcleo de un compilador en C++20 para el ecosistema SnapKitty. Según la model card, se trata de un compilador que define un dialecto MLIR propio (PIRTM), con módulos para multiplicidad racional, recibos criptográficos de contractividad, control de ganancia exponencial, verificación de pruebas vía FFI con Lean 4 y generación de código LLVM/WebAssembly. No se trata de un modelo de lenguaje, visión u otro tipo de IA, por lo que las especificaciones habituales de modelos (parámetros, contexto, cuantización) no son aplicables.

La relevancia de este repositorio es nula para el ámbito de la IA generativa. No hay descargas, ni licencia declarada, ni idiomas soportados, ni pipeline de inferencia. La fecha de creación (2026-09-03) es posterior a la fecha actual, lo que sugiere que podría tratarse de un repositorio ficticio o de prueba. La búsqueda web no arroja resultados relacionados con este proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplicable (no es un modelo de IA) |
| Parametros totales | No disponible |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card menciona "Sovereign Source" pero no se especifica el texto de la licencia) |
| Formato de pesos | No aplicable (no hay pesos) |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado. El repositorio describe un compilador con una arquitectura por capas: un lexer/parser (Antlr4 o escrito a mano), un dialecto MLIR llamado PIRTM, un functor de multiplicidad que maneja exponentes racionales, un sistema de recibos de contractividad basado en SHA-256, un validador de admisibilidad, un módulo de control de ganancia exponencial (zeno-finton), un puente FFI con Lean 4 para verificación de pruebas y un backend de generación de código LLVM/WebAssembly. No hay información sobre datos de entrenamiento, tokens, RLHF o DPO, ya que no es un modelo de aprendizaje automático.

## Capacidades

- Compilación de un lenguaje DSL llamado SnapKitty/PIRTM.
- Definición de un dialecto MLIR con operaciones como `operator_atom`, `binary_add`, `binary_mul`, `stratum_boundary`, etc.
- Cálculo de potencias con exponente racional (`p^m` con `m ∈ Q`).
- Generación de recibos criptográficos (SHA-256) y cadenas Merkle para verificar la contractividad.
- Validación de AST y emisión de recibos de rechazo.
- Control de ganancia exponencial mediante la función `κ(t) = κ₀ · e^(-αt)`.
- Verificación de pruebas mediante integración con Lean 4.
- Generación de código LLVM IR y WebAssembly.

No hay capacidades de generación de texto, razonamiento, código (en el sentido de modelos de lenguaje), visión, tool calling, agentes o multilingüismo.

## Casos de uso

- Compilación de programas escritos en el DSL SnapKitty/PIRTM: el compilador traduce el código fuente a representación MLIR y luego a LLVM IR o WebAssembly.
- Verificación formal de propiedades de programas: mediante el puente FFI con Lean 4, se pueden verificar pruebas asociadas a los programas compilados.
- Auditoría de contractividad: los recibos SHA-256 permiten auditar que las transformaciones del compilador mantienen ciertas propiedades de contracción.
- Generación de WebAssembly para despliegue en navegadores o entornos edge.
- Investigación en compiladores y dialectos MLIR: el proyecto puede servir como referencia para implementar dialectos personalizados.
- Integración en el ecosistema SnapKitty como backend de compilación para otros componentes.

Dado que no hay documentación adicional ni releases, estos casos son hipotéticos basados en la descripción de la model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de rendimiento, latencia, throughput ni comparaciones con otros compiladores.

## Requisitos de hardware

No disponible. No se especifican requisitos de hardware para compilar o ejecutar este compilador. Al ser un proyecto de compilador en C++, los requisitos dependerán de la configuración del entorno de desarrollo (compilador C++20, LLVM 17, etc.), pero no se proporcionan datos concretos.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque este repositorio no es un modelo de IA. En el ámbito de compiladores, se podría comparar con otros compiladores de DSL o dialectos MLIR, pero no hay información suficiente para establecer una comparación rigurosa.

## Limitaciones y advertencias

- No es un modelo de IA: cualquier uso como modelo de lenguaje, generación de texto o razonamiento es inválido.
- La licencia no está claramente definida: la insignia indica "Sovereign Source" pero no se proporciona el texto de la licencia, por lo que no se puede determinar si es de código abierto o de uso restringido.
- No hay documentación de usuario, ejemplos de uso ni guías de compilación.
- El repositorio tiene cero descargas y cero likes, lo que sugiere que no ha sido validado por la comunidad.
- La fecha de creación (2026) es futura, lo que podría indicar un error o un repositorio de prueba.
- No se proporcionan instrucciones de instalación, dependencias ni pasos de construcción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Snapkitty/sovereign-pirtm
- No se encontraron otros enlaces relevantes en la búsqueda web.
