# genaforvena/finnegans-fake-char257

## Resumen

Finnegans Fake — character-level es un modelo de lenguaje de 10.942.848 parámetros desarrollado por el usuario de Hugging Face genaforvena. Se trata de un GPT-2 diminuto (6 capas, 6 cabezas de atención, 384 dimensiones de embedding) con un vocabulario a nivel de carácter de 257 tokens y una ventana de contexto de 512 tokens, entrenado exclusivamente sobre el texto completo de *Finnegans Wake* de James Joyce. No es un modelo orientado a producto: su autor lo describe explícitamente como un experimento para averiguar qué le ocurre a un modelo de lenguaje cuando el único idioma que ha visto es un solo libro, y si es capaz de acuñar palabras nuevas al estilo de Joyce en lugar de limitarse a citar las que ya existen.

Su relevancia es metodológica y de investigación, no práctica. El corpus de entrenamiento tiene 224.527 palabras con 58.725 tipos distintos, de los cuales el 79,4% (46.599) son hápax legomena, lo que invalida cualquier tokenización a nivel de palabra y justifica la aproximación a nivel de carácter. La model card documenta además un error de implementación relevante: durante las primeras ejecuciones, las etiquetas se desplazaban dos veces (una por el formateo estilo nanoGPT y otra por el propio `transformers`), de modo que el modelo aprendía a predecir el token t+2 y todas las cifras de pérdida publicadas inicialmente estaban infladas. Las cifras actuales son posteriores a la corrección.

El repositorio se publica bajo licencia CC0-1.0, con pesos en safetensors y compatibilidad declarada con transformers, text-generation-inference y endpoints. No se redistribuye el corpus; el código está en GitHub y el libro lo aporta quien quiera reproducir el entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GPT-2 decoder-only (6 capas, 6 cabezas, 384 dim de embedding) |
| Parámetros totales | 10.942.848 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantización | no disponibles (el repositorio solo publica pesos en safetensors; no hay versiones GGUF, AWQ, GPTQ ni cuantizadas) |
| Idiomas soportados | no disponibles en los metadatos; el único corpus de entrenamiento es el texto en inglés de *Finnegans Wake*, con tokenizador byte-level BPE |
| Licencia | CC0-1.0 |
| Formato de pesos | safetensors |
| Vocabulario | 257 tokens (a nivel de carácter, byte-level BPE con `add_prefix_space: true`) |
| Pérdida de validación (mejor checkpoint) | 1,8840 |
| Pérdida de validación (final del entrenamiento) | 1,9426 |
| Hiperparámetros de entrenamiento | 6.000 iteraciones, batch 24, lr 0,0006, dropout 0,2 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de tipo GPT-2 en su configuración mínima: 6 capas, 6 cabezas de atención, 384 dimensiones de embedding y 512 tokens de contexto. El tokenizador es un byte-level BPE con un vocabulario de 257 tokens, elegido porque el corpus hace imposible una tokenización a nivel de palabra: cuatro de cada cinco tipos léxicos aparecen una sola vez (46.599 de 58.725), y el 69,8% del texto está cubierto por tipos que aparecen cinco veces o más. Con un vocabulario de palabras, la mayoría de los tipos tendría un único ejemplo y cualquier palabra no vista caería en `<unk>`, impidiendo justamente la acuñación léxica que se quería estudiar. El tokenizador inserta un espacio inicial en la decodificación (`tok.decode(tok("riverrun").input_ids)` devuelve `' riverrun'`); el round-trip es exacto, verificado byte a byte sobre 20.000 caracteres del corpus, una vez contabilizado ese espacio.

El entrenamiento consistió en 6.000 iteraciones con batch 24, learning rate 0,0006 y dropout 0,2 sobre el texto completo de *Finnegans Wake* (224.527 palabras, 58.725 tipos, 105 caracteres distintos). No hay constancia de RLHF, DPO ni ajuste por instrucciones de ningún tipo; es un modelo puramente preentrenado sobre un único documento. El repositorio contiene el checkpoint de mejor validación (pérdida 1,8840), no el del final de la ejecución (1,9426). El aspecto técnico más destacable de la ficha es la documentación de un fallo en la función de pérdida: `batch()` devolvía etiquetas pre-desplazadas al estilo nanoGPT mientras que `transformers` las desplaza por su cuenta, con lo que el desplazamiento ocurría dos veces y el modelo aprendía a predecir el token t+2 desde la posición t. El error no lanzaba excepción ni rompía las curvas de entrenamiento; solo se detectó al inspeccionar el texto generado, que parecía haber perdido uno de cada dos caracteres. Tras la corrección, 400 pasos superaron el resultado de los 6.000 pasos defectuosos. No se emplean técnicas como decodificación especulativa, atención lineal ni arquitecturas híbridas.

## Capacidades

- Generación de texto carácter a carácter en el estilo del *Finnegans Wake*: flujo de conciencia, sintaxis fracturada, léxico inventado y mezcla de registros.
- Acuñación de palabras (portmanteaus y neologismos) a partir de los morfemas presentes en el corpus, que es el objetivo declarado del experimento.
- Continuación de prompts cortos en inglés con muestreo configurable (`temperature`, `top_k`, `top_p`); el autor incluye un ejemplo reproducible con semilla 0.
- Compatibilidad con el pipeline `text-generation` de transformers, con text-generation-inference y con endpoints compatibles (etiquetas declaradas en el repositorio).
- No dispone de soporte de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de capacidades multilingües declaradas más allá del material multilingüe presente en el propio libro.
- No dispone de visión, audio, modo de razonamiento (thinking) ni ningún otro modo especial.
- No está ajustado por instrucciones: no sigue instrucciones ni mantiene un formato de diálogo.

## Casos de uso

- Docencia sobre tokenización: sirve para demostrar en clase por qué un corpus con un 79,4% de hápax legomena obliga a tokenizar a nivel de carácter y qué implica un vocabulario de 257 tokens frente a los 50.257 de GPT-2.
- Estudio de modelos diminutos en hardware mínimo: con 10,9 M de parámetros se puede entrenar y ejecutar el ciclo completo de inferencia en CPU o en una Raspberry Pi, lo que lo hace útil como banco de pruebas de pipelines educativos.
- Generación de neologismos para escritura creativa: el modelo produce combinaciones léxicas inexistentes que pueden servir como disparador de ideas en talleres de escritura experimental, siempre con revisión humana y sin expectativa de coherencia gramatical.
- Reproducción de fallos de entrenamiento: la model card documenta el doble desplazamiento de etiquetas, de modo que el modelo sirve como caso de estudio reproducible de un bug silencioso en la función de pérdida que infla la perplejidad sin romper el entrenamiento.
- Pruebas de integración de infraestructura de inferencia: al ser tan pequeño y estar en safetensors con etiqueta de compatibilidad con text-generation-inference, es adecuado para validar despliegues, pipelines de CI/CD y envoltorios de API antes de pasar a modelos grandes.
- Investigación lingüística computacional: permite medir hasta qué punto sobrevive estructura similar al inglés cuando el único input es un texto con 105 caracteres distintos y una ortografía no estándar.
- Análisis de regurgitación y memorización en corpus pequeños: con 6.000 iteraciones sobre un único libro, es un caso útil para estudiar cuánto texto original reproduce un modelo y cuánto transforma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Las únicas métricas reportadas son las pérdidas de validación del propio autor.

| Métrica | Valor |
|---|---|
| Pérdida de validación (mejor checkpoint, el publicado) | 1,8840 |
| Pérdida de validación (final de la ejecución) | 1,9426 |
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |
| Perplejidad comparativa con otros modelos | no disponible |

Ejemplo de salida reproducible incluido en la model card (muestreo con semilla 0, `temperature=0.9`, `top_k=100`, `top_p=0.95`), a partir del prompt `riverrun, past Eve and Adam's,`:

```
riverrun, past Eve and Adam's, hand, to know your white benefaster side and missive signation and rate and par
```

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 44 MB para los pesos (10.942.848 parámetros × 4 bytes), más el coste de activaciones y caché KV para 512 tokens, despreciable en cualquier GPU moderna.
- VRAM estimada en fp16: aproximadamente 22 MB para los pesos.
- Cabe sin dificultad en cualquier GPU de consumo, incluida una GTX 1050 o una iGPU reciente; también funciona en CPU pura y en placas tipo Raspberry Pi.
- GPU recomendadas: ninguna en particular; A100, H100, RTX 4090 o similares están enormemente sobredimensionadas para este modelo. El cuello de botella real es el coste de lanzar el proceso, no el cálculo.
- Opciones de despliegue: transformers con `AutoModelForCausalLM` y `AutoTokenizer` (código de ejemplo incluido en la model card), text-generation-inference (etiqueta declarada) y endpoints compatibles. No hay pesos GGUF publicados, por lo que llama.cpp u Ollama requerirían una conversión previa por parte del usuario; no se documenta ese procedimiento.
- Latencia y throughput: no disponibles. El autor no publica medidas de latencia ni de tokens por segundo.
- Cuantización: no se distribuyen variantes cuantizadas; sería posible generar versiones int8 o int4 con herramientas externas, pero no están validadas por el autor.

## Comparativa con modelos similares

Los datos de los modelos alternativos proceden de conocimiento público general y no de la documentación aportada; conviene verificarlos antes de citarlos.

| Modelo | Parámetros | Contexto | Licencia | Orientación |
|---|---|---|---|---|
| finnegans-fake-char257 | 10,9 M | 512 tokens | CC0-1.0 | Experimental, un único libro, a nivel de carácter |
| GPT-2 small | 124 M | 1.024 tokens | MIT (según la publicación original) | Modelo generalista de propósito múltiple |
| nanoGPT shakespeare-char | ~10,65 M | 256 tokens | MIT (repositorio de referencia) | Experimental, corpus de Shakespeare, a nivel de carácter |
| TinyStories (variante de ~33 M) | ~33 M | no disponible | no disponible | Generación de relatos infantiles sintéticos |

En benchmarks no hay comparación posible: ninguno de estos modelos publica resultados en las suites estándar en la información disponible, y finnegans-fake declara explícitamente que no está pensado para uso real.

## Limitaciones y advertencias

- El propio autor indica que el modelo "no es bueno y no intenta serlo" y que no debe usarse para nada. Cualquier integración en producción sería un uso inadecuado.
- No está ajustado por instrucciones ni por preferencias humanas: no hay RLHF ni DPO, por lo que no responde a formatos de chat ni a instrucciones.
- Riesgo alto de texto sin sentido: la salida imita la superficie del *Finnegans Wake* (ritmo, morfología, ortografía alterada) sin garantía de gramática ni de coherencia semántica.
- Riesgo de memorización y regurgitación de pasajes del libro original, dado que se entrenó 6.000 iteraciones sobre un único documento. El corpus no se redistribuye con el repositorio.
- Situación legal del corpus: *Finnegans Wake* es de dominio público en Irlanda, el Reino Unido y la Unión Europea, pero no en Estados Unidos hasta 2035. La consideración de si los pesos entrenados son obra derivada del texto de entrenamiento no está resuelta en ningún sentido.
- La licencia CC0-1.0 se aplica a los pesos y al código, pero no aclara la situación del texto fuente en jurisdicciones donde sigue protegido.
- Sesgos previsibles: el vocabulario, la ortografía y las referencias culturales provienen de un texto irlandés de 1939 con fuerte carga multilingüe y religiosa, lo que condiciona cualquier salida.
- Limitación de contexto severa: 512 tokens frente a los 8.000-128.000 de los modelos actuales; no admite documentos largos ni conversaciones multi-turno extensas.
- El tokenizador inserta un espacio inicial que no estaba en el prompt; hay que anticiparlo para no interpretarlo como una pérdida de fidelidad en la decodificación.
- Advertencia metodológica: todas las cifras de pérdida publicadas antes de la corrección del doble desplazamiento de etiquetas estaban infladas y no deben usarse para comparar; solo las de esta ficha (1,8840 y 1,9426) son posteriores a la corrección.
- Idiomas soportados: no declarados. El entrenamiento sobre un solo libro no permite afirmar capacidad multilingüe real.
- Sin datos de benchmarks, sin métricas de latencia y sin versiones cuantizadas: cualquier evaluación de idoneidad en producción parte de cero.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/genaforvena/finnegans-fake-char257
- Repositorio de código (CC0): https://github.com/genaforvena/finnegans-fake
- Paper o informe técnico: no disponible
- Demostración interactiva: no disponible
- Otros enlaces relevantes: no disponible. La búsqueda web realizada devolvió únicamente páginas de proveedores de correo electrónico (Yahoo Mail, Zoho Mail) sin relación alguna con el modelo.
