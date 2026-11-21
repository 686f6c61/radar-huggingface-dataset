# Antoine2718/LeanTorch-Cert

## Resumen

LeanTorch-Cert es un proyecto de verificacion formal de redes neuronales desarrollado por Antoine2718, publicado en Hugging Face bajo licencia MIT. No se trata de un modelo de lenguaje ni de un modelo generativo, sino de una herramienta que combina tres piezas: una biblioteca en Lean 4 para definir redes neuronales con comprobacion de formas en tiempo de compilacion, un importador exacto de modelos PyTorch a Lean que preserva los pesos como racionales diadicos sin redondeo, y un certificador de propagacion de intervalos (IBP) con teoremas demostrados en Lean 4 sobre los reales.

El objetivo del proyecto es permitir que un desarrollador exporte una red neuronal entrenada en PyTorch, la importe en Lean 4 y obtenga certificados de robustez verificados mecanicamente por el comprobador de teoremas, en lugar de confiar en tests empiricos. La innovacion principal es que los certificados se refieren a la red definida sobre los numeros reales, no a la inferencia en coma flotante de PyTorch, y que el sistema esta disenado para no producir cotas inseguras: las operaciones no soportadas devuelven `none` en lugar de un intervalo potencialmente incorrecto.

El proyecto esta anclado a Lean 4.15.0 y Mathlib v4.15.0, e incluye un backend tensorial en C puro para ejecucion sobre `Float` y un prototipo legacy de puente con libtorch que no es funcional. No se ha publicado informacion sobre parametros, contexto, idiomas ni benchmarks, ya que no es un modelo de aprendizaje automatico en el sentido convencional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Biblioteca de verificacion formal en Lean 4 (no es un modelo neuronal); incluye DSL de definicion de redes, importador PyTorch y certificador IBP |
| Parametros totales | no disponible (no es un modelo con parametros entrenados) |
| Parametros activos | no aplica |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no aplica; el importador usa racionales diadicos exactos |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | MIT |
| Formato de pesos | JSON con racionales diadicos exactos generado por el exportador FX de PyTorch; pesos en Lean como `ℝ` |

## Arquitectura y entrenamiento

LeanTorch-Cert se organiza en cuatro modulos. `LeanTorch/Core` define `Tensor`, `DenseLayer` y `LayerChain`, con comprobacion de que las anchuras adyacentes coinciden mediante el sistema de tipos; es generico sobre el tipo escalar, de modo que la misma definicion se ejecuta sobre `Float` y se demuestra sobre `ℝ`. `LeanTorch/Elab` proporciona el DSL `torch_net % [...]`, la directiva `#assert_network_shape` y `#import_torch_model`, que lee el JSON del exportador en tiempo de elaboracion con pesos racionales exactos. `LeanTorch/FFI` y `ffi/` implementan un backend tensorial en C puro como objetos externos de Lean, con errores de forma como errores `IO` y sin liberacion manual. `LeanTorch/Cert` requiere Mathlib y contiene `RealInterval`, `evalChainIBP`, el teorema `evalChainIBP_sound`, `verify_robustness_via_ibp` y `LyapunovConditions`.

El flujo de trabajo es: exportar el modelo con `ModelExporter(model, x).build_spec("m")` y `spec.write_json("m.json")`, importarlo en Lean con `#import_torch_model_noncomputable "m.json" as MNet : ℝ`, y certificar con `python/leantorch_exporter/ibp.py`, que calcula cotas exactas con `Fraction`, para convertir la caja resultante en un teorema mediante `verify_robustness_via_ibp`. El paquete Python incluye ademas un entrenador CEGIS de funciones de Lyapunov. IBP soporta Linear, ReLU y LeakyReLU con pendiente mayor o igual que cero; `tanh` y Sigmoid devuelven `none`.

## Capacidades

- Definicion de redes neuronales feedforward en Lean 4 con comprobacion estatica de formas mediante el sistema de tipos.
- Importacion exacta de modelos PyTorch a Lean 4 preservando pesos como racionales diadicos, sin redondeo.
- Certificacion de robustez mediante propagacion de intervalos (IBP) con teorema de correccion `evalChainIBP_sound` demostrado en Lean 4.
- Verificacion de condiciones de Lyapunov registradas como estructura de datos (`LyapunovConditions`).
- Ejecucion de la red sobre `Float` mediante un backend tensorial en C puro integrado por FFI.
- Exportacion desde PyTorch mediante un exportador basado en FX.
- Entrenamiento empirico de funciones de Lyapunov mediante CEGIS en Python.
- Soporte de capas Linear, ReLU y LeakyReLU (pendiente no negativa) en el certificador IBP.
- No soporta vision, audio, generacion de texto, tool calling ni razonamiento de multiples pasos.

## Casos de uso

- Verificacion formal de robustez de clasificadores pequenos: exportar una red feedforward entrenada en PyTorch, importarla en Lean 4 y obtener una caja de cotas exactas que se convierte en teorema, util para publicaciones que requieren garantias mecanizadas.
- Auditoria de modelos en entornos regulados: el certificado se refiere a la red sobre los reales y puede adjuntarse como evidencia formal en documentacion de conformidad, con la salvedad de que no modela el redondeo de coma flotante.
- Docencia e investigacion en verificacion formal: el proyecto sirve como ejemplo completo de integracion entre un framework de aprendizaje profundo y un asistente de pruebas, con toolchain fijado y comandos reproducibles.
- Desarrollo de tecnicas de IBP exactas: el modulo `ibp.py` con `Fraction` permite comparar cotas exactas frente a implementaciones en coma flotante y detectar perdidas de precision.
- Entrenamiento de funciones de Lyapunov con CEGIS: el entrenador de `python/` genera candidatos que luego se registran en Lean mediante `LyapunovConditions`, como paso previo a una demostracion de estabilidad.
- Prototipado de DSLs de redes en asistentes de pruebas: el DSL `torch_net % [...]` y las directivas de elaboracion sirven de base para extender la definicion de arquitecturas con garantias estaticas.
- Integracion en pipelines de CI: `lake build` compila las pruebas de `LeanTorch/Cert` y `Examples`, de modo que una regresion en las demostraciones rompe la build.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No se aplican requisitos de VRAM para inferencia de un modelo, ya que el proyecto no incluye pesos entrenados.
- El backend nativo es CPU float64 y solo soporta tensores de rango 1 a 2; no hay soporte de CUDA.
- El puente con libtorch en `ffi/torch/` es un prototipo legacy y no es funcional.
- La compilacion de Mathlib desde fuente es muy lenta; se recomienda ejecutar `lake exe cache get` para descargar los artefactos precompilados.
- Toolchain requerido: Lean 4.15.0 con Mathlib v4.15.0, fijados en `lean-toolchain` y `lakefile.lean`.
- El paquete Python se instala en modo editable con `pip install -e ".[test]"` y se prueba con `pytest`.
- No se dispone de datos de latencia ni throughput.

## Comparativa con modelos similares

| Proyecto | Enfoque | Licencia | Estado |
|---|---|---|---|
| LeanTorch-Cert | Verificacion formal en Lean 4 con importador PyTorch e IBP certificado | MIT | Publicado, toolchain fijado |
| Otros verificadores de redes | Herramientas como alpha-beta-CROWN o Marabou, basadas en solvers y no en asistentes de pruebas | no disponible | no disponible |
| Frameworks de pruebas en asistentes | Bibliotecas de demostracion sobre redes en Coq o Isabelle | no disponible | no disponible |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- Los certificados se refieren a la red definida sobre los numeros reales con los pesos exportados; no modelan el redondeo de la inferencia en float32 o float64 de PyTorch.
- IBP solo soporta Linear, ReLU y LeakyReLU con pendiente mayor o igual que cero; `tanh` y Sigmoid devuelven `none` y nunca una caja insegura.
- `LyapunovConditions` registra las desigualdades puntuales, pero Lean no comprueba que el `gradV` suministrado sea realmente el gradiente de `V`, y la estructura por si sola no demuestra estabilidad.
- El entrenador de Lyapunov en Python es empirico: no encontrar un contraejemplo no constituye una prueba.
- El puente con libtorch y el soporte de CUDA no estan disponibles; el backend nativo es CPU float64 y de rango 1 a 2.
- La licencia MIT permite uso comercial, pero el proyecto no ofrece ningun modelo entrenado ni servicio desplegable.
- No se ha publicado informacion sobre sesgos, alucinacion o cobertura idiomatica, ya que no es un modelo linguistico.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Antoine2718/LeanTorch-Cert
- Script de instalacion de Elan: https://raw.githubusercontent.com/leanprover/elan/master/elan-init.sh
