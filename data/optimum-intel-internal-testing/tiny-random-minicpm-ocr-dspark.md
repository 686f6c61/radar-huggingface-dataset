# optimum-intel-internal-testing/tiny-random-minicpm-ocr-dspark

## Resumen

`tiny-random-minicpm-ocr-dspark` es un modelo de la organizacion `optimum-intel-internal-testing`, un espacio de Hugging Face utilizado por el equipo de Optimum-Intel para alojar artefactos de prueba. El modelo se presenta con la etiqueta `qwen3` en sus metadatos y un total de 1.989.760 parametros segun el peso real en safetensors, lo que lo situa en la categoria de modelos diminutos (del orden de 2 millones de parametros).

Por su nombre y procedencia, se trata de un checkpoint sintetico de tipo "tiny-random": pesos inicializados aleatoriamente con una arquitectura derivada de Qwen3 y un proposito de validacion de pipelines de conversion y cuantizacion en el ecosistema Optimum-Intel (OpenVINO, IPEX, etc.), no de inferencia real. La referencia a "minicpm-ocr" y "dspark" en el identificador sugiere que se emplea para probar rutas de exportacion o integracion relacionadas con modelos OCR de MiniCPM y variantes "dspark", pero no hay documentacion publica que lo confirme.

Es relevante unicamente como pieza de infraestructura de testing: no debe evaluarse como modelo de produccion ni utilizarse para tareas reales de generacion, OCR o razonamiento. Su interes practico es para desarrolladores que contribuyen a Optimum-Intel y necesitan un artefacto ligero y reproducible para pruebas de CI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3, segun tag; sin confirmar en model card) |
| Parametros totales | 1.989.760 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card publica unicamente la licencia (`apache-2.0`) y no incluye ninguna descripcion de arquitectura, datos de entrenamiento ni proceso de alineacion. El tag `qwen3` en los metadatos de Hugging Face apunta a una implementacion de transformer basada en la familia Qwen3, pero no hay confirmacion de dimensiones de capas, numero de cabezas de atencion ni vocabulario.

El nombre "tiny-random" y el tamano de aproximadamente 2 millones de parametros indican que los pesos son aleatorios y no han sido entrenados. No se dispone de informacion sobre tokens de entrenamiento, composicion del dataset, RLHF, DPO ni ninguna innovacion tecnica (atencion lineal, decodificacion especulativa, etc.). Cualquier afirmacion sobre capacidades de entrenamiento seria especulativa.

## Capacidades

- No se puede afirmar ninguna capacidad funcional: los pesos son aleatorios y el modelo no ha sido entrenado.
- No hay evidencia de soporte de tool calling ni function calling.
- No hay evidencia de soporte de agentes ni razonamiento multi-paso.
- No hay informacion sobre capacidades multilingues.
- No hay informacion sobre modos especiales (thinking, vision, audio, OCR) mas alla de la referencia "ocr" en el nombre, que no esta respaldada por la model card.
- El tag `qwen3` sugiere compatibilidad estructural con herramientas del ecosistema Qwen, pero no implica capacidades reales.

## Casos de uso

- Pruebas de CI en Optimum-Intel: el modelo sirve como artefacto ligero (menos de 2 millones de parametros) para validar pipelines de conversion a OpenVINO o de cuantizacion sin consumir recursos significativos.
- Validacion de exportacion a safetensors: al ser un checkpoint pequeno, permite comprobar rutas de carga y guardado en tests automatizados.
- Pruebas de integracion de la ruta "minicpm-ocr": por el nombre, podria emplearse para verificar el flujo de exportacion de modelos OCR de MiniCPM en el ecosistema Optimum.
- Verificacion de manejo de arquitecturas Qwen3: util para comprobar que las herramientas de Optimum reconocen y procesan correctamente el tag y la configuracion de Qwen3.
- Tests de regresion de tokenizer y configuracion: permite validar que los cambios en el codigo no rompen la carga de checkpoints con arquitecturas declaradas.
- Reproducibilidad de bugs: al ser un modelo publico y minimo, facilita compartir casos de fallo entre desarrolladores sin distribuir pesos grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un modelo con pesos aleatorios y sin entrenamiento, cualquier metrica de calidad (MMLU, HumanEval, GSM8K) carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en fp32 (aproximadamente 8 MB para 2 millones de parametros), y aun menos en fp16 o int8.
- GPU recomendadas: cualquier GPU, incluida una iGPU o CPU, es suficiente; no requiere A100, H100 ni RTX 4090.
- Cabe en cualquier GPU consumer, e incluso en CPU y en dispositivos embebidos.
- Opciones de despliegue: al ser un checkpoint de test, el uso previsto es mediante las herramientas de Optimum-Intel (exportacion a OpenVINO, pruebas con IPEX). No se ha validado su uso con vLLM, llama.cpp, Ollama o TGI, y al no estar entrenado no tiene sentido desplegarlo para inferencia.
- Latencia y throughput: no disponibles; al no ser un modelo funcional, las metricas de rendimiento no son representativas.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables en la misma categoria (checkpoints "tiny-random" de testing) con documentacion publica suficiente para establecer una comparativa tecnica rigurosa. La comparacion con modelos OCR reales como MiniCPM-OCR o Qwen3-VL no seria significativa dado que este checkpoint no ha sido entrenado.

## Limitaciones y advertencias

- Pesos aleatorios: el modelo no ha sido entrenado y no produce salidas coherentes; no debe usarse para inferencia real.
- Sin model card sustantiva: solo se publica la licencia, por lo que no hay informacion sobre sesgos, datos ni limitaciones declaradas por el autor.
- Riesgo de alucinacion: total, en el sentido de que cualquier salida es ruido sin relacion con la entrada.
- Limitaciones de contexto e idioma: no disponibles.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero al no ser un modelo funcional la licencia es irrelevante en la practica.
- Uso previsto limitado a testing interno: la organizacion `optimum-intel-internal-testing` indica que es un artefacto de pruebas; no hay garantia de mantenimiento ni de estabilidad del repositorio.
- No debe citarse como modelo OCR ni como modelo Qwen3 en comparativas de rendimiento.

## Enlaces

- Hugging Face: https://huggingface.co/optimum-intel-internal-testing/tiny-random-minicpm-ocr-dspark
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion proporcionada.
