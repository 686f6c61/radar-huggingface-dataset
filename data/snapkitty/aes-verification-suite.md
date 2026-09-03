# Snapkitty/aes-verification-suite

## Resumen

AES-128 Algebraic Verification Suite no es un modelo de inteligencia artificial, sino un conjunto de herramientas de verificacion criptografica de codigo abierto desarrollado por Snapkitty (SNAPKITTYWEST). Su proposito es proporcionar evidencia comprobable por maquina de que AES-128 resiste el criptanalisis algebraico a lo largo de 10 rondas, formalizando el concepto "Topography of Failure" para demostrar exactamente donde y por que las estrategias de ataque algebraico encuentran barreras matematicas.

La suite incluye herramientas Python para aritmetica de campos finitos GF(2^8), verificacion de la S-box de AES, busqueda corregida de trails diferenciales MILP, computacion de rango Jacobiano sobre GF(2), y pruebas formales completas en Lean 4 con cero axiomas sin demostrar (zero sorry). El resultado terminal afirma que no existe un operador Q con coste inferior a 2^97 para invertir AES-128 completo de 10 rondas.

Este repositorio es relevante para la comunidad de seguridad y criptografia porque ofrece verificacion formal y herramientas reproducibles para evaluar la resistencia de un estandar critico en infraestructuras globales. Fue publicado en HuggingFace el 3 de septiembre de 2026 y cuenta con 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Tipo de artefacto | Suite de verificacion criptografica (no es un modelo de IA) |
| Arquitectura | No aplica (herramientas Python + pruebas formales Lean 4) |
| Parametros totales | No aplica |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No disponible (codigo y documentacion en ingles) |
| Licencia | AGPL-3.0 (tri-licencia con BSL-1.1 y MPL-2.0) |
| Formato de pesos | No aplica (codigo fuente Python y Lean 4) |

## Arquitectura y entrenamiento

Este artefacto no es una red neuronal y no ha sido entrenado. Se trata de una suite de verificacion compuesta por dos tipos de componentes: herramientas Python en `src/` y pruebas formales en Lean 4 en `lean4/`.

Las herramientas Python implementan aritmetica de campos finitos GF(2^8) (`gf256.py`), la S-box de AES como x^254 con transformacion afin (`sbox.py`), computacion de rango Jacobiano 128x128 sobre F_2 (`jacobian.py`), y una busqueda MILP corregida de trails diferenciales para 4-8 rondas (`trail_search.py`), que corrige un error de indexacion en ShiftRows presente en formulaciones estandar. Las pruebas Lean 4 cubren invariantes de trails diferenciales, estructura algebraica de AES (descomposicion R_NL, rango vs teorema de inversion) y el resultado terminal de las tres barreras (difusion, no linealidad y entrelazamiento).

Las tres barreras demostradas son: (1) difusion con numero de rama MDS 5, que produce al menos 25 S-boxes activas tras 4 rondas y 63+ tras 10 rondas con probabilidad 2^-378+; (2) no linealidad con grado algebraico efectivo de ~127 tras 10 rondas, sin atajo polinomial por debajo de complejidad exponencial; y (3) entrelazamiento del programa de claves, donde 11 claves de ronda (1408 bits) estan determinadas por una clave de 128 bits, sin estrategia divide-y-venceras por debajo de 2^97.

## Capacidades

- Verificacion de aritmetica GF(2^8): multiplicacion, potenciacion e inversion en el campo finito, todas verificadas.
- Verificacion de la S-box de AES: implementacion como x^254 con transformacion afin, contrastada contra la tabla estandar.
- Busqueda de trails diferenciales MILP: para 4 a 8 rondas, con correccion del bug de indexacion en ShiftRows.
- Computacion de rango Jacobiano: analisis de rango de la matriz Jacobiana 128x128 sobre F_2.
- Pruebas formales Lean 4: invariantes de trails, estructura algebraica y resultado terminal, todas con cero axiomas sin demostrar (zero sorry).
- Prueba de fallo B_A: demostracion formal de que la linealizacion implica perdida de informacion (Jacobiano con rango deficiente).
- Frontera rango vs inversion: establece que rango F_2 = 128 es necesario pero no suficiente para inversion eficiente.
- Reduccion a requisito funcional unico: el sistema de restricciones C reduce la posibilidad de romper AES-128 a la existencia de un operador Q con coste inferior a 2^97.
- Verificacion de resistencia algebraica: evidencia formal de que AES-128 completo de 10 rondas resiste la inversion algebraica.
- Ejecucion unificada: script `verify_all.py` que ejecuta todas las verificaciones e imprime resultados.

## Casos de uso

- Auditoria de seguridad de implementaciones AES-128: el suite permite verificar que una implementacion cumple las propiedades algebraicas esperadas, ejecutando `python src/verify_all.py` sobre el codigo fuente.
- Investigacion academica en criptanalisis algebraico: los resultados de trails diferenciales y el teorema de inversion pueden servir como base para publicaciones o comparaciones con nuevos ataques.
- Verificacion formal de propiedades criptograficas: las pruebas Lean 4, con cero axiomas sin demostrar, proporcionan garantias matematicas rigurosas para articulos o informes tecnicos.
- Educacion avanzada en criptografia: el codigo de `gf256.py` y `sbox.py` es didactico para ensenar aritmetica de campos finitos y diseno de AES en cursos universitarios.
- Evaluacion de seguridad de sistemas basados en AES: los resultados de probabilidad de trails (2^-150 a 2^-300) pueden citarse en evaluaciones de riesgo de sistemas que dependen de AES-128.
- Desarrollo de herramientas de criptanalisis: la busqueda MILP corregida puede reutilizarse o ampliarse para otros cifradores de la familia SPN.
- Verificacion de la correccion de herramientas MILP: la correccion del bug de indexacion en ShiftRows puede servir como referencia para otras implementaciones de busqueda de trails diferenciales.

## Benchmarks y rendimiento

Los resultados clave de la suite se presentan en la tabla de trails diferenciales:

| Rondas | S-boxes activas | Peso del trail | Probabilidad | Estado |
|---|---|---|---|---|
| 4 | 25 | 150 bits | 2^-150 | Cota ajustada (Daemen-Rijmen) |
| 5 | 26 | 156 bits | 2^-156 | Verificado |
| 6 | 30 | 180 bits | 2^-180 | Verificado |
| 7 | 34 | 204 bits | 2^-204 | Verificado |
| 8 | 50 | 300 bits | 2^-300 | Barrera de seguridad |

Resultado terminal: AES-128 completo de 10 rondas resiste la inversion algebraica. No existe operador Q con Cost(Q) < 2^97.

No se han publicado resultados de benchmarks comparativos con otros modelos o herramientas en la informacion disponible, ya que este artefacto no es un modelo de IA y no presenta metricas de rendimiento de inferencia.

## Requisitos de hardware

- Las herramientas Python requieren solo una CPU moderna y Python 3 con la dependencia `pulp` (instalable via pip). No se requiere GPU.
- Las pruebas Lean 4 requieren Lean 4 y Mathlib instalados, y se compilan con `lake build`. El hardware necesario es modesto: cualquier estacion de trabajo con 8-16 GB de RAM es suficiente.
- No hay requisitos de VRAM ni GPU, al no tratarse de un modelo de inferencia.
- Opciones de despliegue: ejecucion local con `python src/verify_all.py` o compilacion de pruebas con `lake build`.

## Comparativa con modelos similares

No disponible. Este artefacto no es un modelo de IA y no existen modelos comparables en la misma categoria dentro del ecosistema de HuggingFace. En el ambito de herramientas de verificacion criptografica, no se han identificado alternativas equivalentes en la informacion proporcionada que combinen herramientas Python y pruebas formales Lean 4 para AES-128.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, codigo ni realiza inferencias. No debe confundirse con un LLM.
- Alcance limitado a AES-128: no cubre AES-192 ni AES-256, ni otros cifradores.
- Requiere conocimientos especializados en criptografia y algebra para interpretar correctamente los resultados.
- La licencia AGPL-3.0 (opcion por defecto) tiene implicaciones para uso comercial: cualquier redistribucion o servicio basado en este codigo debe publicar su codigo fuente bajo la misma licencia.
- Los resultados dependen de la correccion de las herramientas y pruebas; aunque se afirma que todas las pruebas Lean 4 estan completamente demostradas, la verificacion externa independiente no esta documentada.
- El repositorio tiene 0 descargas y 0 likes en HuggingFace, lo que sugiere que no ha sido ampliamente validado por la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/Snapkitty/aes-verification-suite
- Repositorio GitHub: https://github.com/SNAPKITTYWEST/aes-verification-suite
- License Policy Engine: https://github.com/SNAPKITTYWEST/license-policy-engine
