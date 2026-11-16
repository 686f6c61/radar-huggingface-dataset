# anuml/anlp-a3-models

## Resumen

`anuml/anlp-a3-models` es un repositorio de checkpoints publicado por el usuario anuml bajo el identificador de un trabajo académico de la asignatura ANLP (Advanced Natural Language Processing), correspondiente a la "Assignment 3". No se trata de un modelo fundacional listo para uso general, sino de un conjunto de pesos entrenados para una tarea muy concreta: el descifrado criptográfico a nivel de carácter, formulada como un problema de secuencia a secuencia con un modelo decoder-only tipo Prefix-LM.

La model card describe dos arquitecturas distintas empaquetadas bajo el mismo repositorio: un transformer decoder-only con RMSNorm, RoPE y atención GQA, y un modelo Mamba basado en space-state models. Ambos operan sobre un tokenizador a nivel de carácter con un alfabeto fijo de 86 tokens, lo que refleja el carácter didáctico y acotado del experimento: mapear entradas cifradas a caracteres en claro.

El modelo es relevante únicamente como referencia académica o como base reproducible para experimentos de descifrado con arquitecturas modernas (transformer frente a SSM). No hay evidencia de entrenamiento a gran escala, evaluación estándar ni soporte multilingüe, y el repositorio no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only Transformer (RMSNorm, RoPE, GQA) y Mamba SSM |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en PyTorch nativo, `best_model.pt`) |
| Idiomas soportados | no disponible (tokenizador a nivel de carácter con alfabeto fijo de 86 tokens) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`torch.load`, fichero `.pt` con `config` y `model_state_dict`) |

## Arquitectura y entrenamiento

El repositorio contiene checkpoints de dos familias de modelos. La primera es un transformer decoder-only con normalización RMSNorm, embeddings posicionales rotatorios (RoPE) y atención con query grouping (GQA), configurado como Prefix-LM para mapear secuencias cifradas a caracteres en claro. La segunda es un modelo Mamba basado en space-state models, incluido presumiblemente como comparación arquitectónica dentro del mismo trabajo académico. La tokenización es a nivel de carácter sobre un alfabeto fijo de 86 símbolos, lo que elimina la necesidad de un vocabulario BPE y simplifica el problema de descifrado a una sustitución posicional aprendida.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del corpus, el número de tokens vistos, ni sobre si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se documentan innovaciones técnicas más allá de la propia formulación Prefix-LM y la comparación transformer/Mamba. El tamaño del repositorio (0,1 GB) sugiere checkpoints de pequeña escala, coherentes con un ejercicio docente y no con un modelo de producción.

## Capacidades

- Descifrado de texto a nivel de carácter: el modelo transforma secuencias cifradas en caracteres en claro, presumiblemente para cifrados de sustitución simples empleados en el contexto del assignment.
- Modelado de secuencias con Prefix-LM: permite condicionar la generación en un prefijo (la entrada cifrada) y decodificar la salida correspondiente.
- Generación autoregresiva con causal LM: la etiqueta `causal-lm` indica que el modelo puede usarse como lenguaje autorregresivo sobre el alfabeto de 86 tokens.
- Comparación de arquitecturas: el repositorio incluye tanto transformer como Mamba, lo que permite evaluar ambas familias sobre la misma tarea.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües.

## Casos de uso

- Reproducción de experimentos académicos: el repositorio está pensado para descargar los checkpoints con `scripts/sync_models.py` y cargarlos con `DecoderOnlyTransformer`, de modo que un investigador puede replicar los resultados del assignment sin reentrenar.
- Estudio comparativo transformer frente a Mamba: al incluir ambas arquitecturas sobre la misma tarea de descifrado, sirve como banco de pruebas controlado para medir diferencias de convergencia y calidad en secuencias de caracteres.
- Enseñanza de tokenización a nivel de carácter: el alfabeto fijo de 86 tokens y la formulación Prefix-LM son un ejemplo didáctico de cómo se aborda un problema de mapeo secuencia a secuencia sin vocabulario subword.
- Prototipado de descifrado de cifrados de sustitución: el modelo puede emplearse como línea base para tareas de criptoanálisis elemental sobre alfabetos acotados, siempre que la distribución de entrada se parezca a la del entrenamiento.
- Investigación sobre GQA y RoPE en modelos pequeños: los checkpoints permiten inspeccionar cómo se comportan estas técnicas en un decoder-only de escala reducida y con un vocabulario mínimo.
- Docencia y prácticas de PyTorch: el ejemplo de carga incluido en la model card (`torch.load` + reconstrucción de config + `load_state_dict`) es directamente reutilizable en un curso de NLP aplicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio completo ocupa 0,1 GB, por lo que los checkpoints individuales son de pequeño tamaño y caben holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM; una RTX 3060 o superior es más que suficiente. No se requiere A100 ni H100.
- Cabe en GPU consumer: sí, con alta probabilidad, dado el tamaño del repositorio y la naturaleza del experimento.
- Opciones de despliegue: carga directa en PyTorch mediante `torch.load` y la clase `DecoderOnlyTransformer` del paquete `src.models.transformer`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al no haber pesos en GGUF ni safetensors, estos motores no son aplicables sin conversión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se conocen modelos públicos directamente comparables: la tarea (descifrado a nivel de carácter con alfabeto de 86 tokens) y el carácter académico del repositorio no tienen equivalentes claros en el ecosistema open source.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| anuml/anlp-a3-models | no disponible | no disponible | Descifrado carácter a carácter | MIT | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo de ámbito académico: no hay evidencia de entrenamiento a gran escala ni de evaluación estándar; no debe tratarse como un modelo de propósito general.
- Dominio restringido: el tokenizador cubre un alfabeto fijo de 86 caracteres, por lo que cualquier entrada fuera de ese conjunto quedará fuera de distribución.
- Idiomas: no se documenta soporte multilingüe; el comportamiento fuera del alfabeto de entrenamiento es impredecible.
- Riesgo de alucinación: en tareas de descifrado, el modelo puede producir salidas plausibles pero incorrectas sin señal de confianza asociada.
- Sesgos: no se documentan análisis de sesgo; al ser un corpus académico acotado, los sesgos dependerán de los datos de entrenamiento, que no se describen.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene citar el repositorio original.
- Formato de pesos: al ser ficheros `.pt` cargados con `torch.load`, es necesario confiar en el origen del checkpoint o usar `weights_only=True` para mitigar riesgos de deserialización.
- Sin métricas publicadas: no hay benchmarks, curvas de entrenamiento ni comparaciones cuantitativas que permitan estimar su calidad real.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/anuml/anlp-a3-models
- No se han encontrado en la información proporcionada papers, blogs, repositorios adicionales ni demos asociados.
