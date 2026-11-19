# divinetribe/gemma-4-31b-it-abliterated-4bit-mlx

## Resumen

`divinetribe/gemma-4-31b-it-abliterated-4bit-mlx` es una cuantizacion en 4 bits del modelo `null-space/gemma-4-31b-it-abliterated`, publicada por el desarrollador independiente divinetribe (Matt Macosko) dentro del ecosistema de su proyecto `claude-code-local`. Se trata de un derivado de Gemma 4 de 31B de parametros en su variante instruction-tuned, al que se le ha aplicado una ablacion de la direccion de rechazo (abliteration) para eliminar los comportamientos de negativa del modelo original, y que despues se ha convertido a formato MLX para inferencia nativa en Apple Silicon.

El modelo resuelve un problema muy concreto: ejecutar un LLM de 31B sin censura y de forma totalmente local en un Mac, sin API, sin clave y sin conexion a la nube. Con 30.697.345.280 parametros y un peso de repositorio de 17,3 GB, cabe en equipos con 32 GB de memoria unificada y se mueve con holgura en configuraciones de 64 GB o mas. La cuantizacion es afina de 4 bits con grupo de tamano 64, y el autor reporta unos 15 tokens por segundo en un M4 Max con `mlx-lm` 0.21 o superior.

Su relevancia actual esta en la combinacion de tres factores poco frecuentes a la vez: tamano de 31B (capacidad de razonamiento notablemente superior a los 7B-12B habituales en local), eliminacion de rechazos para flujos de trabajo que requieren contenido sin filtros, y un formato optimizado para el hardware de Apple. La licencia declarada es Apache 2.0, aunque el enlace de licencia apunta a la licencia propia de Gemma 4 de Google, lo que introduce una ambiguedad relevante para uso comercial que se detalla mas abajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Gemma 4), pesos cuantizados en MLX |
| Parametros totales | 30.697.345.280 (aproximadamente 31B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits afina con group size 64 (MLX); el modelo base esta en BF16 |
| Idiomas soportados | ingles (declarado en la model card) |
| Licencia | Apache 2.0 declarada; enlace de licencia apunta a Gemma 4 License de Google |
| Formato de pesos | safetensors en formato MLX (`mlx`, `mlx-4bit`) |
| Tamano del repositorio | 17,3 GB |
| Libreria de inferencia | `mlx-lm` (0.21+) |
| Hardware objetivo | Apple Silicon (memoria unificada) |
| Modelo base | `null-space/gemma-4-31b-it-abliterated` (BF16, aproximadamente 62 GB) |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Gemma 4 en su variante de 31B instruction-tuned. La model card etiqueta el modelo como multimodal, lo que sugiere que la familia base incorpora capacidades de vision ademas de texto, aunque la ficha no aporta detalles sobre la composicion exacta de la torre de vision ni sobre el tokenizador multimodal. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si el modelo base original empleo RLHF, DPO u otras tecnicas de alineacion; esos datos corresponden a Google y no se reproducen en la informacion proporcionada.

La innovacion tecnica principal de este derivado es doble. Por un lado, la **abliteration**: siguiendo el metodo de Arditi et al. (2024), se identifica la direccion en el espacio de activaciones que media en el comportamiento de rechazo y se proyecta fuera de los pesos, de modo que el modelo deja de negarse a responder a ciertas peticiones. Por otro, la **cuantizacion MLX de 4 bits afina con grupo de 64**, que reduce el peso de aproximadamente 62 GB en BF16 a unos 17 GB, permitiendo que un modelo de 31B quepa en memoria unificada de 32 GB. El autor indica que el modelo se probo con `mlx-lm` 0.21 o superior y que alcanza unos 15 tokens por segundo en un M4 Max.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles.
- Razonamiento y respuesta a instrucciones (variante instruction-tuned del modelo base).
- Capacidades multimodales heredadas de Gemma 4, segun la etiqueta `multimodal` de la model card (no se detalla el alcance exacto en esta cuantizacion).
- Generacion de codigo, segun el uso previsto dentro del stack `claude-code-local` para tareas de agente de programacion.
- Comportamiento sin rechazos (uncensored) gracias a la ablacion de la direccion de rechazo.
- Inferencia totalmente local en Apple Silicon, sin API ni conexion a la nube.
- No se declara soporte explicito de tool calling, function calling ni modo thinking en la informacion disponible.

## Casos de uso

- **Asistente de programacion local en Mac**: el modelo se integra en el stack `claude-code-local`, que expone una API compatible con Anthropic sobre MLX, permitiendo usar un agente de codigo tipo Claude Code sin enviar codigo a la nube. Los 31B de parametros ofrecen capacidad de razonamiento sobre repositorios grandes, y los 17 GB de peso lo hacen viable en un MacBook de 32 GB.
- **Flujos con requisitos de confidencialidad o air-gapped**: el autor mantiene una linea especifica (AirGap AI) para entornos legales, sanitarios y con NDA. Al ejecutarse sin red y sin clave de API, el modelo es adecuado para procesar documentos sensibles en equipos aislados.
- **Generacion de contenido sin filtros editoriales**: la abliteracion elimina las negativas del modelo base, lo que resulta util en tareas creativas, de ficcion o de analisis de contenido sensible donde los rechazos del modelo original interrumpen el flujo de trabajo.
- **Prototipado rapido de agentes en local**: con `mlx-lm` y el servidor MLX del proyecto, se puede levantar un endpoint compatible con la API de Anthropic en minutos y probar cadenas de agentes multi-paso sobre hardware de sobremesa de Apple.
- **Investigacion sobre alineacion y seguridad**: al ser un modelo abliterado publico con una metodologia documentada (proyeccion de la direccion de rechazo), sirve como objeto de estudio para comparar comportamientos de rechazo frente al modelo original y medir el impacto de la ablacion en capacidades y sesgos.
- **Procesamiento por lotes en local para desarrolladores individuales**: tareas de resumen, reescritura o clasificacion de textos en ingles que se ejecutan de noche en un Mac Studio o MacBook Pro, sin coste por token y con los datos sin salir del equipo.

## Benchmarks y rendimiento

El model-index del autor no incluye resultados:

```json
[
  {
    "name": "gemma-4-31b-it-abliterated-4bit-mlx",
    "results": []
  }
]
```

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento declarado es el throughput aproximado de **15 tokens por segundo en un M4 Max** con `mlx-lm` 0.21+, medido por el autor.

## Requisitos de hardware

- **VRAM / memoria unificada**: aproximadamente 17 GB de pesos en disco y en memoria; se recomienda un minimo de 32 GB de memoria unificada para dejar margen al contexto y al runtime de MLX. El autor indica que funciona comodamente en 32 GB y "vuela" en 64 GB o mas.
- **GPU recomendadas**: exclusivamente Apple Silicon. El modelo esta cuantizado en formato MLX y depende de `mlx-lm`, por lo que no es directamente ejecutable en GPU NVIDIA o AMD sin reconversion.
- **Equipos objetivo**: MacBook Pro y Mac Studio con chips M-series (M2 Max, M3 Max, M4 Max y superiores). El autor cita el M4 Max como referencia de rendimiento.
- **Cabe en consumer GPU**: si, en el sentido de hardware de consumo de Apple; no en GPU de consumo NVIDIA con 24 GB o menos sin reconvertir el modelo a otro formato.
- **Opciones de despliegue**: `mlx-lm` (libreria oficial), el servidor MLX compatible con la API de Anthropic del proyecto `claude-code-local`, y scripts de arranque (`scripts/start-mlx-server.sh`). No se menciona soporte de vLLM, llama.cpp, Ollama ni TGI.
- **Latencia y throughput**: aproximadamente 15 tokens por segundo en M4 Max segun el autor; no se proporcionan datos para otros chips.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / hardware | Licencia | Notas |
|---|---|---|---|---|---|
| `divinetribe/gemma-4-31b-it-abliterated-4bit-mlx` | 30,7B | no disponible | MLX 4-bit, Apple Silicon | Apache 2.0 (con enlace a Gemma 4 License) | Abliterado, sin rechazos, 17,3 GB |
| `null-space/gemma-4-31b-it-abliterated` | 31B | no disponible | BF16 safetensors, GPU | no disponible en esta ficha | Modelo base sin cuantizar, aproximadamente 62 GB |
| `mlx-community/...` (referencia del autor) | variable | no disponible | MLX | variable | El autor senala que el repo al que apuntaba el proyecto no existia; este modelo es el reemplazo real |
| Otros modelos de la coleccion "Abliterated MLX for Apple Silicon" | 12B a 70B | no disponible | MLX | variable | Incluye Gemma 4 12B, Llama 3.3 70B, Qwen3, Qwen3-VL, Hermes 4 y Muse Glimmer 30B |

No se dispone de datos de benchmarks que permitan comparar el rendimiento cualitativo frente a estas alternativas.

## Limitaciones y advertencias

- **Ambiguedad de licencia**: la model card declara Apache 2.0, pero el campo `license_link` apunta a la Gemma 4 License de Google, que impone restricciones de uso (incluida una politica de uso aceptable y obligaciones de atribucion). Antes de un uso comercial conviene verificar cual prevalece, ya que los terminos de Gemma pueden ser mas restrictivos que Apache 2.0.
- **Modelo abliterado**: la eliminacion de la direccion de rechazo reduce la seguridad del modelo. El propio autor advierte: "you are now the moderator". No es adecuado para aplicaciones de cara al publico sin capas adicionales de moderacion.
- **Riesgo de alucinacion**: como cualquier LLM de esta familia, puede generar informacion falsa con aparente seguridad; la cuantizacion a 4 bits puede degradar ligeramente la fidelidad respecto al BF16.
- **Idioma**: solo se declara ingles. El rendimiento en castellano no esta garantizado ni documentado.
- **Contexto**: no se publica la longitud de contexto soportada, lo que impide planificar tareas de contexto largo con garantias.
- **Hardware restringido**: el formato MLX limita el despliegue a Apple Silicon; no es portable a GPU NVIDIA sin reconversion.
- **Perdida por cuantizacion**: la cuantizacion de 4 bits con group size 64 introduce una perdida de precision respecto al modelo base en BF16, especialmente perceptible en tareas de razonamiento matematico o de codigo muy preciso.
- **Mantenimiento**: es un derivado de un desarrollador independiente; la actualizacion y el soporte dependen del autor y no de Google.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/divinetribe/gemma-4-31b-it-abliterated-4bit-mlx
- Modelo base: https://huggingface.co/null-space/gemma-4-31b-it-abliterated
- Repositorio `claude-code-local`: https://github.com/nicedreamzapp/claude-code-local
- Perfil del autor en GitHub: https://github.com/nicedreamzapp
- Coleccion "Abliterated MLX for Apple Silicon": https://huggingface.co/collections/divinetribe/abliterated-mlx-for-apple-silicon
- Leaderboard de agentes locales Agent-12: https://nicedreamzapp.github.io/agent12/
- Modelos del autor: https://nicedreamzwholesale.com/software/huggingface/
- Portafolio de software: https://nicedreamzwholesale.com/software/
- AirGap AI: https://nicedreamzwholesale.com/airgap/
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
