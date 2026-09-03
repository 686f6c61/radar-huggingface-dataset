# Snapkitty/sovereign-trinity-kernel

## Resumen

Sovereign Trinity Kernel no es un modelo de inteligencia artificial, sino un paquete de LaTeX (con componentes en Lean 4, Dex, Lua y ensamblador 6502) desarrollado por Ahmad Ali Parr y Jessica L. Williams (SNAPKITTYWEST) como parte de la propuesta aes-formal para NIST. Su propósito es garantizar que cada número en un paper criptográfico sea computado en tiempo de compilación, verificado formalmente y sellado con entropía cuántica real, eliminando cualquier valor hardcodeado o intermediario de confianza.

El sistema integra una cadena de herramientas: entropía cuántica del ANU QRNG (fluctuaciones del vacío en Australia), un emulador de CPU 6502 que actúa como orquestador Mixture-of-Agents, kernels Dex verificados por formas, pruebas Lean 4 sin "sorry" y renderizado LuaLaTeX. El resultado es un PDF donde todos los números derivan de la semilla cuántica y de verificaciones formales, no de valores escritos manualmente.

Relevancia: aunque no es un modelo de IA, representa una aproximación radical a la reproducibilidad y verificabilidad en publicaciones criptográficas. Para desarrolladores e investigadores interesados en integridad de artefactos, prueba formal y generación procedural de contenido técnico, ofrece un caso de estudio singular. No se dispone de información sobre parámetros, arquitectura neuronal ni capacidades de procesamiento de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un pipeline de compilacion LaTeX con componentes Lean 4, Dex, Lua y ensamblador 6502) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | Tri-licencia: AGPL-3.0 \| BSL 1.1 (con cambio a MIT el 2029-01-01) \| MIT |
| Formato de pesos | no disponible (no hay pesos; los artefactos son codigo fuente: .lua, .tex, .lean, .dex, .asm) |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado. La arquitectura es un pipeline de compilación con cinco etapas:

1. **Entrada de entropía**: el ANU QRNG (Australian National University) mide fluctuaciones del vacío cuántico y entrega una semilla aleatoria en tiempo real.
2. **Orquestación**: un emulador de CPU 6502 (NMOS) escrito en Lua actúa como controlador Mixture-of-Agents. Según el valor de la semilla (comparado con 0x80), decide entre un agente "aggressive" (95% de overhead) o "conservative" (115% de overhead) para los cálculos criptográficos.
3. **Verificación de kernels**: Dex (lenguaje de programación con verificación de formas) define kernels GF(2), GCD, Horner y CAD, compilados a LLVM. Se reporta que `gf2_rank=128` y `branch=2`.
4. **Pruebas formales**: Lean 4 con "zero sorry" cierra todas las igualdades aritméticas mediante `norm_num`. Los artefactos se guardan en `artifacts/qr_constants.json` (por ejemplo, `BICLIQUE_TIME_EXP=96`, `SBOX_T_GATES=42`).
5. **Renderizado**: LuaLaTeX ejecuta los cálculos en tiempo de compilación y genera el PDF final, sellado con una cadena WORM Bifrost.

No hay entrenamiento, no hay dataset, no hay RLHF. Los autores lo describen como "el paper es la especificación ejecutable".

## Capacidades

- Generación de números criptográficos (conteo de qubits, tiempos de biclique, overhead) sin valores hardcodeados.
- Verificación formal de igualdades aritméticas mediante Lean 4 con cero "sorry".
- Verificación de formas (shape-safe) de kernels GF(2) mediante Dex.
- Orquestación de agentes basada en entropía cuántica real (ANU QRNG).
- Emulación de CPU 6502 dentro de LuaLaTeX para rutas de decisión.
- Renderizado de documentos LaTeX con cálculos en tiempo de compilación.
- Sellado de integridad mediante cadena WORM (Bifrost).
- No tiene capacidades de lenguaje natural, razonamiento conversacional, generación de código, tool calling ni visión.

## Casos de uso

- **Publicación de papers criptográficos verificables**: los autores lo usan en su propuesta aes-formal para NIST. Cada número del paper se computa y verifica formalmente, de modo que un revisor puede reproducir el pipeline completo y obtener los mismos valores.
- **Auditoría de artefactos técnicos**: si se necesita demostrar que un documento no contiene números introducidos manualmente, este sistema permite que el PDF sea una salida determinista de un pipeline semilla cuántica + pruebas formales.
- **Integración de prueba formal en LaTeX**: el paquete `quantum-resources.sty` permite a investigadores incluir comandos como `\QubitCountTrinity{shor}{2048}` que calculan y verifican resultados en tiempo de compilación.
- **Generación de entropía para simulaciones**: la semilla cuántica del ANU puede usarse para inicializar simulaciones o procesos que requieran aleatoriedad genuina, aunque el sistema está pensado para documentos.
- **Experimentos con Mixture-of-Agents deterministas**: el enrutamiento 6502 demuestra un patrón de decisión basado en umbrales sobre entropía externa, útil como caso de estudio en sistemas multiagente.
- **Formación en herramientas de verificación**: combina Lean 4, Dex y Lua en un solo flujo, sirviendo como ejemplo didáctico de integración de pruebas formales y verificación de formas en un documento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El sistema no es un modelo de IA y no tiene métricas de rendimiento estándar (MMLU, HumanEval, GSM8K). La única métrica mencionada es el log de compilación que reporta "Rank: 128 | Branch: true | Lean Phase 13: CLOSED" y la verificación de "ASP Stable Model Verified".

## Requisitos de hardware

- No se especifican requisitos de GPU ni VRAM. El pipeline es principalmente CPU-bound (LuaLaTeX, Lean, Dex).
- Se requiere `luasocket`, `lua-cjson` y la librería `libaes_kernels.so` en el directorio de trabajo.
- El emulador 6502 y los kernels Dex se ejecutan en CPU; no hay aceleración por GPU documentada.
- Para compilar se necesita LuaLaTeX con `--shell-escape` habilitado.
- El acceso al ANU QRNG requiere conexión a internet (el servicio es remoto).
- No hay información sobre latencia o throughput. El tiempo de compilación dependerá de la complejidad del documento y de la verificación Lean.

## Comparativa con modelos similares

No disponible. No existe una categoría comparable de "modelos" que hagan lo mismo. Los sistemas más cercanos serían paquetes de verificación formal (como Coq, Isabelle) o herramientas de reproducibilidad (como ReproZip), pero no son modelos de IA. No se puede establecer una comparación directa con LLMs u otros modelos generativos.

## Limitaciones y advertencias

- **No es un modelo de IA**: carece de capacidades de generación de texto, razonamiento conversacional o procesamiento de lenguaje natural.
- **Dependencia de servicios externos**: la semilla cuántica proviene del ANU QRNG; si el servicio no está disponible, el pipeline no funciona.
- **Complejidad de compilación**: requiere LuaLaTeX con `--shell-escape`, librerías Lua específicas y la biblioteca `libaes_kernels.so` compilada.
- **Riesgo de sobreingeniería**: el uso de un emulador 6502 y de entropía cuántica para decidir overhead puede considerarse excesivo para aplicaciones prácticas; su valor es más demostrativo que funcional.
- **Licencia tri-licencia**: se puede elegir entre AGPL-3.0, BSL 1.1 (con cambio a MIT en 2029) o MIT. La opción BSL restringe el uso comercial hasta 2029.
- **Sin soporte de producción**: no hay documentación sobre mantenimiento, pruebas en entornos reales ni casos de éxito fuera del propio proyecto aes-formal.
- **Riesgo de alucinación**: no aplica, ya que no genera texto; sin embargo, la dependencia de la semilla cuántica introduce no-determinismo en los valores finales del documento.

## Enlaces

- HuggingFace: https://huggingface.co/Snapkitty/sovereign-trinity-kernel
- Repositorio aes-formal (NIST): https://github.com/SNAPKITTYWEST/aes-formal
- Paper Sovereign Stack (PDF): https://snapkittywest.github.io/hyperkitty/papers/sovereign-stack-unified.pdf
- Otros enlaces: no disponibles en la información proporcionada.
