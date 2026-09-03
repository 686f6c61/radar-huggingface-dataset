# Snapkitty/reverse-quantum-walk

## Resumen

Snapkitty/reverse-quantum-walk no es un modelo de inteligencia artificial convencional, sino una implementación de software y hardware de verificación formal para dinámicas de "reverse quantum walk" sobre un puente ER (Einstein-Rosen / EPR). Desarrollado por Jessica L. Westerhoff (SNAPKITTYWEST) y Ahmad Ali Parr, el proyecto combina un motor de recurrencia en Rust, pruebas formales en Lean 4 y Agda, model checking con Kani, circuitos de conocimiento cero en Circom y un interlock en SystemVerilog. Su objetivo es sustituir las restricciones R1CS discretas de los campos finitos por restricciones espaciales continuas en ℝᴺ, convirtiendo la lógica de conocimiento cero en un motor de resolución geométrica CAD con invariantes formalmente verificadas.

El repositorio en HuggingFace presenta cero descargas y cero likes, y la model card indica una triple licencia (BSL-1.1, AGPL-3.0 y MPL-2.0) más una opción comercial, aunque el campo de licencia en HuggingFace aparece como no disponible. No se proporcionan pesos de red, pipeline de inferencia ni idiomas soportados, pues no se trata de un modelo de lenguaje ni de visión, sino de un sistema de verificación formal y computación de conocimiento cero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema de verificación formal (Rust + Lean 4 + Agda + Circom + SystemVerilog), no es una red neuronal |
| Parametros totales | no aplica (no hay pesos de red) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no aplica (no hay pesos cuantizables) |
| Idiomas soportados | no disponibles |
| Licencia | Tri-licencia: BSL-1.1 / AGPL-3.0 / MPL-2.0 + comercial (segun model card); en HuggingFace aparece como no disponible |
| Formato de pesos | no aplica (no hay pesos safetensors ni GGUF) |

## Arquitectura y entrenamiento

El sistema no se entrena con datos. Su arquitectura se compone de varios módulos interconectados:

- **Motor Rust** (`crates/engine/`): implementa una recurrencia en punto fijo Q16.16 con `SCALE=65536`, `L_EFF_MAX=65530` y `TAU_R_MAX_DRIFT=1024`. Incluye una "Primitive Shattering Matrix" que descompone valores de 32 bits en microbits de 1 bit con la invariante `b·(1−b)=0`, y un kernel CAD que resuelve restricciones `C(X)=0` mediante Newton-Raphson en 2D.
- **Verificación formal**: Kani model checking para acotar `l_eff` y `drift`; Lean 4 con el teorema `step_bounded` (con "sorry" pendiente); Agda con 16 invariantes conjuntas y prueba `refl`.
- **Hardware y ZK**: SystemVerilog (`microbit_interlock.sv`) que falla en "closed" si el acumulador de deriva supera el umbral; circuitos Circom (`MicrobitFullAdder.circom`, `MicrobitAdderAndDrift.circom`) que garantizan la validez de bits y la compuerta de deriva.
- **Criptografía**: se mencionan presupuestos de Poseidon2 (5087 R1CS) y Dilithium5 (clave pública de 2592 bytes, firma de 4627 bytes), aunque no se detalla su integración.

No hay fase de entrenamiento ni dataset. El sistema se construye y verifica mediante compilación y pruebas formales.

## Capacidades

- Verificación formal de invariantes matemáticas (contracción, deriva, validez de bits, entropía, radio espectral).
- Descomposición de restricciones R1CS de campos finitos en microbits booleanos con invariantes `b·(1−b)=0`.
- Sustitución de lógica discreta de conocimiento cero por restricciones continuas resueltas con un kernel CAD (Newton-Raphson).
- Model checking de límites numéricos mediante Kani (cubriendo `l_eff ≤ L_EFF_MAX` y `drift ≤ TAU_R_MAX_DRIFT`).
- Pruebas formales en Lean 4 (teorema `step_bounded`) y Agda (16 invariantes conjuntas, con `SystemInvariant`).
- Generación de circuitos Circom para verificación de conocimiento cero (R1CS) con compuertas de deriva.
- Interlock hardware en SystemVerilog que detiene el sistema si se supera el umbral de deriva.
- Integración criptográfica con Poseidon2 y Dilithium5 (presupuestos verificados en Agda).

## Casos de uso

- **Verificación de circuitos de conocimiento cero**: el sistema permite comprobar formalmente que las restricciones R1CS de un circuito Circom cumplen invariantes de validez de bits y deriva, útil para auditorías de zk-SNARKs y zk-rollups.
- **Desarrollo de hardware seguro**: el interlock en SystemVerilog puede integrarse en FPGAs o ASICs para garantizar que un procesador de cómputo cuántico simulado no exceda límites de deriva, aplicable en prototipos de hardware criptográfico.
- **Pruebas formales de sistemas dinámicos**: investigadores en matemáticas y criptografía pueden usar las librerías de Lean 4 y Agda para verificar teoremas sobre contracción y estabilidad en sistemas de recurrencia.
- **Auditoría de implementaciones de post-cuántica**: los presupuestos de Dilithium5 y Poseidon2 verificados en Agda sirven para auditar implementaciones de firmas digitales y hashes resistentes a computación cuántica.
- **Educación en verificación formal**: el repositorio puede usarse como caso de estudio para enseñar model checking (Kani), demostración interactiva (Lean 4, Agda) y diseño de circuitos ZK (Circom).
- **Investigación en puentes ER=EPR**: el modelo ofrece una implementación concreta de dinámicas de quantum walk sobre puentes ER, útil para experimentos conceptuales en física teórica y computación cuántica simulada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El proyecto no presenta métricas de rendimiento de inferencia ni comparativas con otros modelos, ya que no es un modelo de aprendizaje automático.

## Requisitos de hardware

- No requiere GPU ni VRAM para su uso principal, pues es un sistema de verificación formal y compilación.
- Requiere herramientas de compilación: Rust (con `cargo`), Kani (`cargo-kani`), Lean 4 (con `lake`), Agda, Circom y `snarkjs`.
- Para el módulo SystemVerilog se necesita un simulador o sintetizador compatible (por ejemplo, Verilator o Quartus) y opcionalmente una FPGA para probar el interlock físico.
- El kernel CAD (Newton-Raphson) es ligero y puede ejecutarse en CPU estándar; no se especifican requisitos mínimos ni máximos.
- No hay opciones de despliegue tipo vLLM, Ollama o TGI porque no es un modelo de lenguaje.

## Comparativa con modelos similares

No disponible. No existen modelos comparables en el ámbito de la IA convencional, ya que este proyecto no pertenece a la categoría de modelos de lenguaje, visión o generación. Dentro del dominio de verificación formal, podría compararse con otras librerías de pruebas formales (por ejemplo, proyectos en Coq o Isabelle/HOL), pero no se dispone de datos suficientes para establecer una comparación rigurosa.

## Limitaciones y advertencias

- No es un modelo de IA: no puede generar texto, imágenes ni realizar inferencias sobre datos. Su uso está restringido a verificación formal y computación de conocimiento cero.
- La licencia es compleja: tri-licencia BSL-1.1 / AGPL-3.0 / MPL-2.0 con condiciones diferentes según el uso (evaluación, despliegue en red, uso comercial). Es imprescindible revisar el archivo LICENSE antes de cualquier uso.
- El teorema `step_bounded` en Lean 4 tiene un "sorry" pendiente, lo que significa que la prueba no está completa y podría contener errores lógicos.
- No se proporcionan datos de rendimiento, ni benchmarks, ni casos de uso validados en producción. El proyecto parece estar en fase de investigación o prototipo.
- La fecha de creación (2026) y la ausencia de descargas o likes sugieren que el proyecto es muy reciente o no ha sido evaluado por la comunidad.
- La model card menciona "WORM Sealed" y "Sovereign Stack" sin explicación detallada; podría implicar restricciones adicionales de uso o distribución.
- No hay garantías de soporte, mantenimiento o estabilidad del código.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Snapkitty/reverse-quantum-walk
- Perfil del autor (mencionado en la model card): https://github.com/SNAPKITTYWEST (no verificado)
- No se proporcionan otros enlaces (papers, blogs, demos) en la información disponible.
