# fpadovani/eng-100mb-after-jpn-baseline-ckpt500_seed455

## Resumen

Este modelo es un ajuste fino (fine-tune) de `fpadovani/ppt-art-lang-jpn-baseline-100mb_seed455`, un modelo base entrenado con 100 MB de texto en japonés. El ajuste se realiza con 100 MB de texto en inglés, dando lugar a un experimento de transferencia lingüística y aprendizaje continuo. El nombre del modelo refleja su procedencia: `eng-100mb-after-jpn-baseline-ckpt500_seed455` indica que se trata de un entrenamiento en inglés después de un baseline en japonés, con un checkpoint en el paso 500 y una semilla fija de 455.

Desarrollado por Francesco Padovani (Universidad de Groningen), este modelo forma parte de una serie de experimentos sobre el orden de los idiomas en el preentrenamiento y su efecto en el rendimiento final. Con solo 124,77 millones de parámetros, es un modelo extremadamente pequeño diseñado para investigación académica, no para producción. Su relevancia radica en que permite estudiar cómo el aprendizaje secuencial de idiomas afecta a la capacidad generativa del modelo, un área de interés creciente en el estudio de la transferencia entre lenguas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (decoder-only, basada en el modelo base PPT-ART) |
| Parametros totales | 124.770.816 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles (ajuste fino), japones (modelo base) |
| Licencia | no disponible (la model card indica "license" sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only, heredada del modelo base `fpadovani/ppt-art-lang-jpn-baseline-100mb_seed455`. El modelo base fue preentrenado con 100 MB de texto en japones, y este ajuste fino anade 100 MB de texto en ingles mediante Supervised Fine-Tuning (SFT) utilizando la libreria TRL de Hugging Face. El entrenamiento se realizo con el framework Transformers 4.56.2 y PyTorch 2.11.0.

No se proporcionan detalles sobre la composicion del dataset de entrenamiento, el numero total de tokens, ni si se aplicaron tecnicas adicionales como RLHF o DPO. El checkpoint se guardo en el paso 500 del entrenamiento, lo que sugiere un entrenamiento corto. El experimento forma parte de una serie que invierte el orden de los idiomas (japones despues de ingles, como se ve en el modelo hermano `jpn-100mb-after-eng-baseline-ckpt500_seed455`), lo que permite comparar el efecto del orden de los idiomas en el rendimiento final.

## Capacidades

- Generacion de texto en ingles, con capacidad residual en japones heredada del modelo base.
- Respuesta a preguntas abiertas y de opinion, como se muestra en el ejemplo de la model card ("If you had a time machine...").
- Capacidad de seguir instrucciones simples en formato chat (la model card muestra un ejemplo con roles de usuario y asistente).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision ni audio.
- El modelo es demasiado pequeno para tareas complejas de razonamiento o generacion de codigo.

## Casos de uso

- Investigacion academica sobre transferencia entre idiomas: el modelo permite estudiar como el preentrenamiento en japones afecta al aprendizaje posterior de ingles, comparandolo con el modelo inverso (`jpn-100mb-after-eng-baseline-ckpt500_seed455`).
- Experimentos de aprendizaje continuo: al ser un modelo pequeno y rapido de entrenar, es util para probar tecnicas de fine-tuning secuencial y evaluar el fenomeno del olvido catastrofico.
- Validacion de pipelines de entrenamiento: su tamano reducido lo hace ideal para verificar que un pipeline de SFT con TRL funciona correctamente antes de escalar a modelos mayores.
- Ensenanza y demostraciones: puede usarse en cursos de procesamiento de lenguaje natural para ilustrar conceptos de fine-tuning, transferencia linguistica y evaluacion de modelos.
- Comparacion de orden de idiomas: junto con su contraparte inversa, permite analizar si el orden de los idiomas en el entrenamiento influye en el rendimiento final.
- Pruebas de inferencia en hardware limitado: al ser un modelo de 124 M de parametros, puede ejecutarse en CPU o GPUs muy modestas, lo que lo hace util para probar entornos de despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar. El modelo parece ser un experimento de investigacion sin evaluacion publica documentada.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB en FP32 (el modelo pesa aproximadamente 500 MB en safetensors). Con cuantizacion a 8 bits o 4 bits, cabria en cualquier GPU moderna.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM. Una RTX 3060 o superior seria mas que suficiente. Tambien puede ejecutarse en CPU para inferencia lenta.
- Si cabe en consumer GPU: si, en practicamente cualquier GPU consumer actual.
- Opciones de despliegue: transformers (pipeline de Hugging Face), llama.cpp (si se convierte a GGUF), Ollama (si se convierte a formato compatible), TGI o vLLM (aunque son opciones sobredimensionadas para un modelo tan pequeno).
- Latencia y throughput: no disponible, pero al ser un modelo de 124 M de parametros, la generacion deberia ser muy rapida incluso en CPU.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria. El modelo es un experimento de investigacion sin publicaciones asociadas ni benchmarks que permitan una comparacion objetiva. Los modelos hermanos del mismo autor (`jpn-100mb-after-eng-baseline-ckpt500_seed455`) son los unicos comparables directos, pero no se han publicado metricas de rendimiento.

## Limitaciones y advertencias

- Modelo extremadamente pequeno (124 M de parametros): su capacidad de generacion y razonamiento es muy limitada en comparacion con modelos modernos.
- Entrenado con solo 200 MB de texto en total (100 MB en japones + 100 MB en ingles): la cobertura linguistica y tematica es muy reducida.
- No se especifica la licencia: la model card indica "license" sin detallar los terminos, lo que impide conocer las restricciones de uso comercial.
- Riesgo de alucinaciones: al ser un modelo pequeno entrenado con pocos datos, es probable que genere respuestas incoherentes o inventadas.
- Sesgos desconocidos: no se ha documentado ningun analisis de sesgos.
- No apto para produccion: es un modelo de investigacion sin garantias de calidad, seguridad ni rendimiento.
- Contexto limitado: no se especifica la longitud de contexto, pero por el tamano del modelo es probable que sea pequena (tipicamente 512 o 1024 tokens).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fpadovani/eng-100mb-after-jpn-baseline-ckpt500_seed455
- Modelo base: https://huggingface.co/fpadovani/ppt-art-lang-jpn-baseline-100mb_seed455
- Modelo hermano (orden inverso de idiomas): https://huggingface.co/fpadovani/jpn-100mb-after-eng-baseline-ckpt500_seed3407
- Despliegue en FriendliAI: https://friendli.ai/models/fpadovani/eng-100mb-after-jpn-baseline-ckpt500_seed455
- Libreria TRL: https://github.com/huggingface/trl
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/ppt_art_lang/runs/y61c9lbm
