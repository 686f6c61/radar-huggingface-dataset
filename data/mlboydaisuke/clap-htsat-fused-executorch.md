# mlboydaisuke/CLAP-HTSAT-fused-ExecuTorch

## Resumen

CLAP-HTSAT-fused-ExecuTorch es una conversión a formato ExecuTorch del modelo CLAP (Contrastive Language-Audio Pretraining) desarrollado por LAION, específicamente la variante HTSAT-fused. Este modelo permite buscar sonidos mediante descripciones textuales en lenguaje natural: dado un clip de audio y una frase, produce dos embeddings de 512 dimensiones (uno por cada modalidad) cuyo producto escalar indica la similitud semántica entre ambos. A diferencia de los clasificadores de audio tradicionales con etiquetas fijas, CLAP permite al usuario elegir las frases de búsqueda en tiempo de ejecución.

La conversión ha sido realizada por mlboydaisuke e incluye dos torres separadas: una torre de audio basada en HTSAT (27,55 M parámetros) y una torre de texto basada en RoBERTa (124,65 M parámetros). Ambas están disponibles en cuantización fp32 e int8 con backend XNNPACK, más una versión Core ML para iOS de la torre de texto. El conjunto int8 ocupa 272 MB frente a los 615 MB de fp32, manteniendo una fidelidad alta (coseno 0,9996 en audio y 0,9908 en texto) y conservando los mismos resultados de clasificación en las pruebas realizadas. La licencia es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dual-tower: HTSAT (audio) + RoBERTa base (texto) |
| Parametros totales | 152,2 M (27,55 M audio + 124,65 M texto) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | Audio: ventana de 10 segundos; texto: 32 tokens |
| Tipos de cuantizacion | fp32, int8 (XNNPACK); Core ML (texto, iOS) |
| Idiomas soportados | no disponible (modelo entrenado principalmente en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | .pte (ExecuTorch), safetensors (modelo original) |

## Arquitectura y entrenamiento

CLAP sigue el paradigma de aprendizaje contrastivo propuesto originalmente en CLIP, pero aplicado al dominio audio-texto. La torre de audio utiliza HTSAT (Hierarchical Token-Semantic Audio Transformer), un transformer jerarquico diseñado para clasificacion de audio, mientras que la torre de texto emplea RoBERTa base. Ambas torres proyectan sus representaciones a un espacio comun de 512 dimensiones con normalizacion L2, de modo que la similitud coseno entre un embedding de audio y uno de texto equivale a su producto escalar.

El modelo original fue entrenado por LAION con un objetivo de contraste entre pares audio-texto a gran escala. La conversion a ExecuTorch se realizo mediante el flujo torch.export -> to_edge_transform_and_lower(partitioner) -> .pte, con delegacion parcial a XNNPACK (64,2 % de cobertura en audio, 77,3 % en texto). Un aspecto tecnico destacable es el manejo del flag `is_longer` del extractor de caracteristicas: el grafo resultante lo ignora deliberadamente y ejecuta siempre la ruta de fusion de cuatro fragmentos, ya que para lotes de una sola muestra el flag es siempre True. Esta decision se valido comparando el grafo sin ramas contra el modulo original, obteniendo una diferencia absoluta maxima de 0,000e+00.

## Capacidades

- Clasificacion de audio zero-shot: el modelo puede clasificar sonidos usando frases arbitrarias definidas en tiempo de ejecucion, sin necesidad de etiquetas predefinidas.
- Busqueda de audio por texto: permite recuperar clips de audio relevantes a partir de una descripcion textual.
- Busqueda de texto por audio: dado un clip, se puede encontrar la frase que mejor lo describe.
- Extraccion de caracteristicas: produce embeddings de 512 dimensiones L2-normalizados para audio y texto, utiles como representaciones densas para tareas posteriores.
- Generacion de embeddings de texto cacheables: la torre de texto puede ejecutarse una sola vez por frase y reutilizarse para multiples clips de audio.
- Inferencia en dispositivo: gracias a la conversion a ExecuTorch con backend XNNPACK, el modelo puede ejecutarse en dispositivos moviles y de borde sin conexion a la nube.
- Compatibilidad con Core ML (solo torre de texto): version para iOS con delegacion completa al acelerador neuronal.

## Casos de uso

- Busqueda de sonidos en bibliotecas de audio: un usuario puede escribir "un perro ladrando" o "una campana sonando" y el sistema recupera los clips mas similares de una coleccion local o remota, usando la torre de texto una vez por frase y la torre de audio por cada clip.
- Moderacion de contenido audiovisual: detectar sonidos problematicos (disparos, gritos, alarmas) en videos subidos por usuarios, comparando embeddings de audio contra un conjunto de frases de riesgo definidas por la plataforma.
- Asistente de accesibilidad para personas con discapacidad auditiva: convertir sonidos ambientales en descripciones textuales en tiempo real, ejecutandose en un telefono movil gracias a la version int8 de 29 MB.
- Clasificacion de sonidos ambientales en IoT: dispositivos de hogar inteligente que distinguen entre "cristal rompiendose", "alarma de humo" o "agua corriendo" sin depender de una lista fija de clases.
- Organizacion automatica de archivos de audio: etiquetar grabaciones de campo, podcasts o material de archivo con frases descriptivas generadas por el usuario, facilitando la busqueda posterior.
- Sistemas de recomendacion musical o de efectos de sonido: sugerir pistas basadas en descripciones textuales del estado de animo o la escena deseada ("musica alegre con piano", "efecto de lluvia suave").
- Verificacion de calidad en produccion audiovisual: comprobar que un efecto de sonido coincide con la descripcion del guion tecnico, comparando el embedding del clip con la frase especificada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (AudioSet, ESC-50, etc.) en la informacion disponible. El autor proporciona metricas de fidelidad de la conversion:

| Metrica | Audio fp32 | Audio int8 | Texto fp32 | Texto int8 |
|---|---|---|---|---|
| Coseno vs eager fp32 | 1,000000 | 0,999613 | 1,000000 | 0,990783 |
| Frases ganadoras correctas | 5/5 | 5/5 | 5/5 | 5/5 |

Tiempos de inferencia en Mac arm64 (mediana de 5 ejecuciones, proceso unico): audio XNNPACK 115,5 ms (fp32) y 115,2 ms (int8); texto XNNPACK 11,6 ms (fp32) y 12,4 ms (int8); texto Core ML 2,5 ms. Como referencia, el modelo eager fp32 tarda 29,0 ms en audio y 13,9 ms en texto en la misma maquina.

## Requisitos de hardware

- Tamano de los archivos: audio fp32 113,1 MB, audio int8 29,1 MB, texto fp32 501,4 MB, texto int8 243,2 MB, texto Core ML 251,2 MB.
- VRAM estimada para inferencia: no disponible, pero los archivos .pte se cargan en memoria; el conjunto int8 completo requiere aproximadamente 272 MB de RAM.
- GPU recomendadas: no aplica, el modelo esta disenado para CPU y aceleradores neuronales en dispositivo (XNNPACK, Core ML).
- Compatibilidad con hardware de consumo: si, esta pensado para ejecutarse en telefonos y dispositivos de borde con Android (XNNPACK) o iOS (Core ML).
- Opciones de despliegue: ExecuTorch runtime con delegado XNNPACK; Core ML para iOS; el modelo original puede usarse con la libreria transformers de HuggingFace.
- Latencia estimada: 115 ms por clip de audio y 12 ms por frase en Mac arm64; en dispositivos moviles puede variar significativamente.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| CLAP-HTSAT-fused (original) | HTSAT + RoBERTa | 152,2 M | 10 s audio / 32 tokens | Apache-2.0 | safetensors |
| CLAP-HTSAT-fused-ExecuTorch (este) | HTSAT + RoBERTa | 152,2 M | 10 s audio / 32 tokens | Apache-2.0 | .pte |
| AST (Audio Spectrogram Transformer) | ViT sobre spectrogramas | 87 M | 10 s audio | MIT | safetensors |

La diferencia principal frente al modelo original es el formato de pesos y la optimizacion para inferencia en dispositivo. AST, mencionado en la model card como alternativa existente, clasifica con las 527 etiquetas de AudioSet pero no soporta busqueda por texto libre.

## Limitaciones y advertencias

- El modelo esta entrenado principalmente para audio ambiental; el habla sintetica puede producir resultados inesperados (en las pruebas, la voz sintetica se clasifico como "lluvia cayendo" con confianza 0,82).
- La cuantizacion int8 de la torre de texto reduce la fidelidad a 0,9908 de coseno, lo que podria afectar a frases muy similares entre si.
- La torre de audio no tiene version Core ML: coremltools falla con una expresion dependiente de datos en el windowing de HTSAT.
- El grafo ignora el flag `is_longer` y ejecuta siempre la ruta de fusion de cuatro fragmentos, lo que es correcto para lotes de una muestra pero no para procesamiento por lotes mayor.
- La longitud de texto esta fijada en 32 tokens; frases mas largas deben truncarse.
- No se proporcionan datos sobre sesgos del modelo ni sobre su comportamiento con idiomas distintos del ingles.
- El repositorio tiene 0 descargas y 0 likes; se trata de una conversion reciente sin validacion amplia por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mlboydaisuke/CLAP-HTSAT-fused-ExecuTorch
- Modelo original: https://huggingface.co/laion/clap-htsat-fused
- Repositorio de conversion: https://github.com/john-rocky/executorch-models
- Repositorio CLAP de LAION: https://github.com/LAION-AI/CLAP
- Documentacion de CLAP en transformers: https://huggingface.co/docs/transformers/model_doc/clap
