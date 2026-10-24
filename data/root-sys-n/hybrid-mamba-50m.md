# root-sys-n/hybrid-mamba-50m

## Resumen

Hybrid Mamba-Attention 50M es un modelo de lenguaje a pequena escala publicado por el usuario root-sys-n en HuggingFace, con un diseno hibrido que combina capas de espacio de estados (Mamba) con capas de atencion causal clasica. El repositorio se presenta explicitamente como un banco de pruebas ("preflight testing") y como material de entrenamiento para Google Colab, no como un modelo entrenado y listo para produccion. Con aproximadamente 49-51 millones de parametros, su interes es fundamentalmente arquitectonico y didactico.

La arquitectura sigue un patron repetido "MMMA MMMA MMMA": nueve capas Mamba y tres capas de atencion, con d_model=512, FFN SwiGLU de 1280 unidades ocultas, RMSNorm y embeddings atados. Las capas Mamba usan una variante simplificada ("Mamba-lite") con d_state=8, d_inner=768, dt_rank=16 y convolucion causal de kernel 4; las capas de atencion son causales con 8 cabezas de 64 dimensiones y codificacion posicional rotatoria (RoPE).

Es relevante ahora porque permite reproducir en CPU o en una sesion gratuita de Colab el pipeline completo (tokenizer BPE, dataset en streaming con packing, bucle de entrenamiento y nueve comprobaciones de preflight) de una arquitectura hibrida moderna. No se ha publicado informacion sobre el estado de entrenamiento, los datos utilizados ni resultados de evaluacion; el repositorio contiene codigo y configuraciones YAML, no una descripcion de pesos entrenados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido Mamba-Attention; patron "MMMA MMMA MMMA" (9 capas Mamba + 3 capas de atencion) |
| Parametros totales | ~50M (rango declarado 49M-51M, autocalibrado) |
| Parametros activos | no disponible (no es un modelo MoE; todas las capas estan activas) |
| Longitud de contexto | no disponible (no se especifica en la model card ni en las configuraciones descritas) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio publica codigo fuente, `config/*.yaml`, `colab.ipynb` y `preflight.py`; no se indica el formato de los pesos) |

Parametros internos declarados: d_model=512, ffn_hidden=1280, Mamba-lite con d_state=8, d_inner=768, dt_rank=16 y d_conv=4; atencion con 8 cabezas, head_dim=64, RoPE y mascara causal; FFN SwiGLU, RMSNorm y embeddings atados.

## Arquitectura y entrenamiento

El modelo es un hibrido secuencial de 12 capas que intercala bloques Mamba y bloques de atencion segun el patron "MMMA MMMA MMMA". Los bloques Mamba implementan una version reducida del state space model: estado d_state=8, dimension interna d_inner=768, rango de paso dt_rank=16 y convolucion causal de kernel 4, lo que reduce el coste frente a una implementacion Mamba completa. Los tres bloques de atencion aportan recuperacion exacta de contexto a largo plazo mediante atencion causal con 8 cabezas de 64 dimensiones y RoPE. El bloque feed-forward es SwiGLU con 1280 unidades ocultas, la normalizacion es RMSNorm y los embeddings de entrada y salida estan atados, lo que permite ajustar el presupuesto de parametros al rango 49M-51M.

El repositorio incluye un tokenizer BPE propio (`src/tokenizer.py`), un cargador de datos en streaming con empaquetado de secuencias (`src/data.py`), el script de entrenamiento (`src/train.py`), dos configuraciones (`colab.yaml` para produccion y `smoke.yaml` para pruebas minimas en CPU) y `preflight.py`, que ejecuta nueve comprobaciones previas en local. No se especifican el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF, DPO o ajuste por instrucciones. Tampoco se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal mas alla del propio esquema hibrido.

## Capacidades

- Generacion de texto autoregresiva: la arquitectura es un LM causal, aunque no hay evidencia publicada de pesos entrenados ni de calidad de generacion.
- Razonamiento y codigo: no disponible; no se han publicado evaluaciones.
- Soporte de tool calling / function calling: no disponible; no se documenta plantilla de chat ni formato de herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declara vocabulario ni corpus por idioma.
- Capacidad especial destacable: el diseno hibrido permite comparar el coste y el comportamiento de capas Mamba frente a capas de atencion dentro del mismo modelo, con un unico flag de configuracion.
- Infraestructura de experimentacion: preflight en CPU, notebook de dos celdas para Colab, dataset en streaming con packing y tokenizer BPE entrenable.
- Vision, audio o modo "thinking": no disponibles.

## Casos de uso

- Pruebas de humo de infraestructura (preflight): ejecutar `preflight.py` en local para validar que el entorno, las dependencias y la construccion del modelo funcionan antes de lanzar un entrenamiento largo en GPU. Adecuado porque el modelo es lo bastante pequeno para caber en CPU.
- Investigacion de arquitecturas hibridas: comparar la misma configuracion con distintas proporciones de capas Mamba y atencion (por ejemplo, 12:0, 9:3, 6:6) para medir el efecto sobre perdida de validacion y velocidad de entrenamiento.
- Docencia y divulgacion: usar el repositorio como ejemplo completo y legible de un LM moderno (RoPE, SwiGLU, RMSNorm, Mamba, BPE, packing) en un tamano que se puede leer y ejecutar en una clase practica.
- Prototipado de pipelines de datos: validar el cargador en streaming con empaquetado de secuencias y el tokenizer BPE antes de reutilizarlos en modelos de mayor escala, donde los errores de datos son mas caros de detectar.
- Entrenamiento desde cero en recursos limitados: lanzar el `colab.ipynb` de dos celdas para obtener un modelo funcional en una sesion gratuita y comprobar el ciclo completo hasta la generacion de texto.
- Desarrollo de harnesses de evaluacion: disponer de un modelo de ~50M para probar herramientas de evaluacion, perplejidad, generacion por lotes o benchmarking de throughput sin consumir presupuesto de GPU.
- Despliegue en el borde como prueba de concepto: con ~50M de parametros, la inferencia cuantizada a 8 o 4 bits ocupa decenas de MB, lo que permite experimentar con integracion en dispositivos de bajos recursos (la viabilidad real depende de que existan pesos entrenados, hoy no documentados).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K, HellaSwag, ARC ni perplejidad, y tampoco indica el estado o la duracion del entrenamiento. Los resultados de la busqueda web no contienen informacion relacionada con este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir del recuento de parametros, no de mediciones publicadas): ~200 MB en fp32, ~100 MB en fp16/bf16, ~50 MB en int8 y ~25 MB en int4, mas el overhead de activaciones, KV cache y runtime.
- GPU recomendadas: cualquier GPU consumer basta para inferencia; una NVIDIA RTX 3060/4060 o superior permite ademas entrenar en bf16 con margen. Para entrenamiento a mayor escala, A100 o H100 solo aportan ventaja por throughput, no por capacidad de memoria.
- Cabe sobradamente en GPU consumer, e incluso en CPU para inferencia y para el modo "smoke" (`config/smoke.yaml`).
- Opciones de despliegue: al no publicarse pesos en formato estandar, no se puede confirmar compatibilidad con vLLM, TGI, llama.cpp u Ollama. El codigo apunta a PyTorch nativo; los modelos Mamba hibridos requieren soporte especifico en muchos runtimes, por lo que la integracion en llama.cpp o vLLM no esta garantizada.
- Latencia y throughput estimados: no disponibles. No hay mediciones publicadas de tokens por segundo ni de latencia por token.

## Comparativa con modelos similares

Los datos de las alternativas provienen de conocimiento general sobre esos modelos publicos y no han sido verificados en la informacion proporcionada; los del modelo evaluado son los unicos extraidos de la model card.

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Estado |
|---|---|---|---|---|---|
| root-sys-n/hybrid-mamba-50m | ~50M | no disponible | Hibrida Mamba-Attention (9:3) | no disponible | Repositorio de codigo, sin evaluacion publicada |
| state-spaces/mamba-130m-hf | ~130M | 2048 (referencia externa) | Mamba pura (SSM) | Apache-2.0 (referencia externa) | Pesos publicados y evaluados |
| HuggingFaceTB/SmolLM2-135M | ~135M | 8192 (referencia externa) | Transformer denso | Apache-2.0 (referencia externa) | Pesos publicados y evaluados |
| Qwen/Qwen2.5-0.5B | ~490M | 32768 (referencia externa) | Transformer denso con GQA | Apache-2.0 (referencia externa) | Pesos publicados y evaluados |

La diferencia practica principal no es de rendimiento sino de madurez: las alternativas ofrecen pesos entrenados, tokenizer publicado y evaluaciones; este repositorio ofrece el andamiaje de arquitectura y entrenamiento.

## Limitaciones y advertencias

- No hay evidencia de que el modelo haya sido entrenado: el repositorio describe codigo, configuraciones y un notebook, pero no publica pesos ni curvas de entrenamiento. Cualquier uso generativo real esta, a dia de hoy, sin fundamento.
- Sesgos conocidos: no disponible; sin dataset documentado no se puede evaluar la composicion de los datos ni los sesgos asociados.
- Riesgo de alucinacion: no evaluable sin pesos entrenados; en un modelo de ~50M el riesgo de generar contenido facticamente incorrecto es estructuralmente alto incluso tras entrenamiento.
- Limitaciones de contexto e idioma: la longitud de contexto no se especifica y no se declara ningun idioma soportado; el tokenizer BPE debe entrenarse sobre un corpus concreto, lo que condiciona la cobertura linguistica.
- Licencia: no disponible. La ausencia de licencia explicita impide asumir permisos de uso comercial, redistribucion o modificacion; hay que contactar con el autor antes de cualquier uso en produccion.
- Caveat de produccion: un modelo de 50M no es adecuado para tareas que requieran conocimiento factual amplio, razonamiento complejo o codigo. Su valor esta en la experimentacion controlada.
- Compatibilidad: las arquitecturas hibridas Mamba-Attention no estan soportadas por todos los runtimes de inferencia, lo que puede limitar el despliegue a PyTorch nativo.
- Los resultados de la busqueda web realizada no guardan relacion con el modelo (corresponden a una aplicacion movil, un juego de mesa y el framework de CERN); no deben usarse como fuentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/root-sys-n/hybrid-mamba-50m
- Ficheros referenciados en la model card (rutas relativas del repositorio, sin URL publica confirmada): `config/colab.yaml`, `config/smoke.yaml`, `src/model.py`, `src/tokenizer.py`, `src/data.py`, `src/train.py`, `preflight.py`, `colab.ipynb`
- Paper, blog, repositorio adicional o demo: no disponibles en la informacion proporcionada.
