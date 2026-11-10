# mradermacher/LFM3-1.7B-abliterated-i1-GGUF

## Resumen

LFM3-1.7B-abliterated-i1-GGUF es una distribucion de pesos cuantizados en formato GGUF del modelo FrostWolfAI/LFM3-1.7B-abliterated, publicada por el usuario mradermacher. El modelo subyacente pertenece a la familia LFM3 (Liquid Foundation Model 3) de Liquid AI, disenada para despliegue en el borde (edge) y en dispositivo, con un enfoque conversacional, agentico y de tool calling. La variante "abliterated" implica que se ha aplicado una tecnica de ablacion de direcciones de rechazo (refusal directions) para eliminar el comportamiento de rechazo del modelo original, lo que da lugar a una version "uncensored" o "decensored".

El repositorio contiene cuantizaciones de tipo imatrix (i1) generadas a partir del modelo base, con una amplia gama de tipos de cuantizacion que abarcan desde IQ1_S hasta Q6_K, lo que permite ajustar el equilibrio entre tamano y calidad segun los recursos de hardware disponibles. El modelo declara soporte para 16 idiomas, incluyendo espanol, y esta etiquetado como compatible con endpoints y con la libreria transformers.

La relevancia de esta ficha radica en que combina un modelo de pequeno tamano (nominalmente 1.7B parametros) orientado a inferencia local, con cuantizaciones optimizadas para hardware de consumo y una licencia LFM 1.0 que condiciona el uso comercial. Es una opcion a considerar para prototipado rapido, agentes locales y experimentacion con modelos sin censura, siempre teniendo en cuenta las advertencias eticas y legales asociadas a las variantes abliterated.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como "liquid", "lfm3"; requiere custom_code) |
| Parametros totales | 899.013 (dato de safetensors del repo base; el nombre indica 1.7B, discrepancia no aclarada) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S; incluye fichero imatrix |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | lfm1.0 (license_name), etiquetada como "other" con enlace a LICENSE |
| Formato de pesos | GGUF (cuantizaciones i1/imatrix); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna en la informacion proporcionada. Las etiquetas del repositorio indican "liquid" y "lfm3", lo que sugiere que el modelo base pertenece a la familia Liquid Foundation Model 3 de Liquid AI, y que requiere codigo personalizado ("custom_code") para su carga en transformers. No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO.

La innovacion tecnica destacable de esta distribucion es el proceso de cuantizacion con imatrix (importance matrix), que genera cuantizaciones de calidad superior para un mismo tamano comparadas con las cuantizaciones estaticas. El repositorio incluye tanto cuantizaciones i1 (weighted/imatrix) como un fichero imatrix para que el usuario pueda generar sus propias cuantizaciones. La variante "abliterated" del modelo base implica la eliminacion de direcciones de rechazo en el espacio de activaciones, un proceso que altera el comportamiento del modelo respecto al original.

## Capacidades

- Generacion de texto conversacional multi-turno, orientada a despliegue en dispositivo y borde.
- Razonamiento ("reasoning") segun las etiquetas del repositorio.
- Soporte de tool calling / function calling ("tool-calling", "agentic").
- Capacidades agenticas y de razonamiento multi-paso segun las etiquetas.
- Multilingue: 16 idiomas declarados (en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl).
- Comportamiento "uncensored"/"decensored" por la ablacion aplicada al modelo base.
- Compatible con endpoints ("endpoints_compatible") y con la libreria transformers.
- No se declaran capacidades de vision, audio ni modo "thinking" explicito en la informacion disponible.

## Casos de uso

- Prototipado local de agentes conversacionales: el modelo, al estar cuantizado en GGUF y ser de pequeno tamano, puede ejecutarse en portatiles y estaciones de trabajo sin GPU dedicada, lo que facilita iterar sobre flujos agenticos antes de escalar a modelos mayores.
- Asistentes personales offline: al soportar 16 idiomas y tool calling, puede integrarse en aplicaciones de escritorio o moviles que requieran privacidad total, sin enviar datos a la nube.
- Generacion de texto creativo sin restricciones: la variante abliterated elimina los rechazos del modelo original, lo que la hace adecuada para experimentacion con narrativa, guiones o contenido que el modelo base rechazaria; debe usarse con las cautelas eticas y legales correspondientes.
- Educacion e investigacion sobre alineacion: permite estudiar el efecto de la ablacion de direcciones de rechazo comparando el comportamiento con el modelo base no abliterated.
- Integracion en pipelines de CI/CD para pruebas de tool calling: su compatibilidad con endpoints y su formato GGUF permiten desplegarlo en servidores de inferencia ligeros (por ejemplo, llama.cpp server) para validar llamadas a funciones en entornos de prueba.
- Traduccion y procesamiento multilingue ligero: con soporte para espanol, ingles, arabe, chino, frances, aleman, italiano, japones, coreano, portugues, vietnamita, tailandes, indonesio, hindi, ruso y polaco, puede emplearse en tareas de traduccion o resumen en entornos con recursos limitados.
- Despliegue en dispositivos de borde (edge): el modelo esta etiquetado como "edge" y "on-device", por lo que encaja en escenarios de IoT, kioscos o asistentes embebidos donde el consumo de memoria es critico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: variable segun cuantizacion. Las cuantizaciones mas pequenas (IQ1_S, IQ2_XXS, Q2_K) pueden ocupar del orden de 0.5-1 GB, mientras que las mayores (Q5_K_M, Q6_K) se aproximan a 1.5-2 GB, asumiendo un modelo de ~1.7B parametros; no se dispone de cifras exactas por cuantizacion en la informacion proporcionada.
- GPU recomendadas: al tratarse de un modelo de pequeno tamano, puede ejecutarse en GPUs de consumo como RTX 3060, RTX 4060, RTX 4090, asi como en GPUs profesionales (A100, H100) sin problema de memoria; tambien es viable en CPU.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU con al menos 2-4 GB de VRAM para las cuantizaciones mayores, y en CPU con llama.cpp para las cuantizaciones mas pequenas.
- Opciones de despliegue: llama.cpp, Ollama (mediante importacion de GGUF), servidores compatibles con endpoints, y cualquier runtime que soporte GGUF. El modelo base requiere transformers con codigo personalizado.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-abliterated-i1-GGUF (este) | 1.7B (nominal) | no disponible | lfm1.0 | GGUF (i1) | Variante abliterated, 16 idiomas, tool calling |
| FrostWolfAI/LFM3-1.7B-abliterated | 1.7B (nominal) | no disponible | lfm1.0 | safetensors | Modelo base sin cuantizar del que deriva este |
| mradermacher/LFM3-1.7B-abliterated-GGUF | 1.7B (nominal) | no disponible | lfm1.0 | GGUF (estatico) | Cuantizaciones estaticas del mismo modelo base |
| Modelo LFM3-1.7B original (Liquid AI) | 1.7B (nominal) | no disponible | lfm1.0 | safetensors | Version no abliterated; no disponible en la informacion |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- La variante abliterated elimina los mecanismos de rechazo del modelo original, lo que puede dar lugar a respuestas inapropiadas, ofensivas o peligrosas; no es apta para aplicaciones de produccion orientadas al publico general sin filtros adicionales.
- Riesgo de alucinacion inherente a los modelos de lenguaje de este tamano; la cuantizacion agresiva (IQ1, IQ2) puede degradar aun mas la coherencia y la fidelidad factual.
- La discrepancia entre el nombre "1.7B" y el dato de safetensors (899.013 parametros) no esta aclarada en la informacion; debe verificarse antes de asumir el tamano real del modelo.
- La licencia LFM 1.0 puede imponer restricciones al uso comercial; es necesario revisar el fichero LICENSE del repositorio antes de cualquier despliegue productivo.
- El modelo base requiere codigo personalizado ("custom_code") para cargarse en transformers; la compatibilidad con herramientas estandar puede ser limitada.
- No se dispone de informacion sobre la longitud de contexto, lo que impide garantizar el rendimiento en conversaciones o documentos largos.
- El soporte multilingue esta declarado pero no verificado con benchmarks; la calidad en idiomas distintos del ingles puede variar.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion comunitaria.
- El proceso de cuantizacion imatrix, aunque mejora la calidad respecto a cuantizaciones estaticas, sigue introduciendo perdida de precision respecto al modelo en safetensors.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/LFM3-1.7B-abliterated-i1-GGUF
- Modelo base: https://huggingface.co/FrostWolfAI/LFM3-1.7B-abliterated
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/LFM3-1.7B-abliterated-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#LFM3-1.7B-abliterated-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos del autor: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
