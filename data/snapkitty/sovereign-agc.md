# Snapkitty/sovereign-agc

## Resumen

El repositorio `Snapkitty/sovereign-agc` no es un modelo de inteligencia artificial, sino una reconstrucción completa del Apollo Guidance Computer (AGC), el ordenador que guió las misiones Apolo a la Luna. Desarrollado por Ahmad Parr, el proyecto reimplementa desde cero todos los sistemas matemáticos del AGC a partir de fuentes primarias documentadas: el proyecto Virtual AGC, los libros de Battin, los programas Luminary 099 y Colossus 249, y las tablas de coeficientes polinómicos de Hastings. El código está escrito en múltiples lenguajes de programación (Fortran 2018, R, Ada/SPARK, Idris 2, APL, Lean 4, OpenQASM) y cubre mecánica orbital, aritmética en complemento a uno, verificación formal y más. Es un proyecto de ingeniería de software, no un modelo entrenado, y su relevancia radica en la fidelidad histórica y la rigurosidad matemática con la que reproduce un sistema de computación crítico de los años 60.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (proyecto de software) |
| Parametros totales | No disponible |
| Parametros activos | No disponible |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No aplica (lenguajes de programación: Fortran 2018, R, Ada/SPARK, Idris 2, APL, Lean 4, OpenQASM) |
| Licencia | Sovereign Source v1.0 (código principal), Apache 2.0 (parte matemática), MIT (pruebas) |
| Formato de pesos | No aplica (código fuente) |

## Arquitectura y entrenamiento

El proyecto no sigue una arquitectura de red neuronal, sino una estructura modular de software. Se compone de varios módulos independientes: una biblioteca R de mecánica orbital (2.350 líneas) con funciones para resolver la ecuación de Kepler, conversión entre elementos orbitales, propagación con armónicos esféricos y matriz de transición de estado; un intérprete del AGC en Fortran 2018 (1.431 líneas) que implementa la ALU de complemento a uno con doble plegado de acarreo, desplazamientos con redondeo y conversión de formatos; y módulos adicionales en Ada/SPARK, Idris 2, Lean 4, APL y OpenQASM para verificación formal, despacho interpretativo y circuitos cuánticos. No hay entrenamiento en el sentido de machine learning; el desarrollo se realizó mediante investigación con herramientas de IA como Perplexity, Kimi, Gemini, Grok y otras, pero el código final fue escrito y verificado por el autor.

## Capacidades

- Resolución de la ecuación de Kepler mediante método de Newton con salvaguarda por bisección y funciones de Stumpff.
- Conversión entre coordenadas cartesianas, keplerianas y elementos equinocciales modificados (MEE), con jacobianos analíticos.
- Propagación orbital con integrador RK4, aceleración J2, tasas seculares J2 y armónicos zonales J2/J3/J4.
- Modelo de gravedad con armónicos esféricos completos (zonal, tesseral y sectorial) usando polinomios asociados de Legendre.
- Propagación de matriz de transición de estado y covarianza para análisis de incertidumbre.
- Implementación de la ALU del AGC en Fortran 2018 con aritmética de complemento a uno de 15 bits, incluyendo el doble plegado de acarreo.
- Verificación formal de propiedades matemáticas en Lean 4 (con cero "sorry") y Ada/SPARK con contratos fantasma.
- Despacho interpretativo en APL basado en indexación de arrays.
- Circuito de encendido cuántico en OpenQASM como extensión del sistema BURNBABY.

## Casos de uso

- Investigación histórica y educativa: el código permite estudiar cómo funcionaba el AGC real, sus algoritmos de navegación y control, y comparar con implementaciones modernas.
- Ingeniería aeroespacial: las rutinas de mecánica orbital en R pueden usarse para simulación de misiones, diseño de trayectorias y análisis de órbitas con alta fidelidad.
- Verificación formal de software crítico: los módulos en Lean 4 y Ada/SPARK demuestran cómo aplicar pruebas matemáticas rigurosas a sistemas de navegación.
- Docencia de programación funcional y dependently typed: el código en Idris 2 y Lean 4 sirve como ejemplo de implementación sin agujeros ni disculpas.
- Reimplementación de sistemas legacy: el intérprete en Fortran 2018 muestra cómo reconstruir un sistema antiguo con estándares modernos y sin dependencias externas.
- Desarrollo de herramientas para análisis numérico: las funciones de integración y resolución de Kepler pueden integrarse en pipelines científicos para propagación de satélites.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al ser un proyecto de software, no hay métricas de rendimiento de modelos de lenguaje.

## Requisitos de hardware

- No requiere GPU ni hardware especializado; es código fuente que se compila y ejecuta en CPU estándar.
- Los módulos en R requieren una instalación de R (versión 3.5+).
- Fortran 2018 requiere un compilador compatible (gfortran 9+ o Intel Fortran).
- Ada/SPARK requiere GNAT con SPARK toolchain.
- Idris 2 y Lean 4 requieren sus respectivos compiladores.
- OpenQASM requiere un entorno de simulación cuántica como Qiskit.
- El consumo de memoria es bajo; el proyecto es ligero.

## Comparativa con modelos similares

No disponible. No existe una categoría de modelos de IA comparable; el proyecto es único en su tipo. Se podría comparar con el proyecto Virtual AGC original, pero esa comparación no es de modelos de IA.

## Limitaciones y advertencias

- No es un modelo de IA: no puede generar texto, razonar ni realizar tareas de procesamiento de lenguaje natural.
- El código está orientado a un dominio muy específico (mecánica orbital y emulación del AGC) y no es generalizable.
- La licencia Sovereign Source v1.0 puede restringir el uso comercial; se debe revisar su texto exacto.
- Algunas partes están bajo Apache 2.0 (matemáticas) y MIT (pruebas), lo que facilita su uso en esos componentes.
- El repositorio no tiene descargas ni likes en HuggingFace, lo que sugiere que es un proyecto reciente o poco difundido.
- No se proporcionan instrucciones de compilación ni documentación de API en la model card; el usuario debe explorar el código fuente.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Snapkitty/sovereign-agc
