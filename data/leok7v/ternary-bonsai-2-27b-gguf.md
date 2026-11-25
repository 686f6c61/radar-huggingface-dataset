# leok7v/Ternary-Bonsai-2-27B-gguf

## Resumen

Ternary Bonsai 2 27B es un modelo multimodal de tipo imagen-texto desarrollado por Prism ML, construido a partir de Qwen3.8-27B de Alibaba Cloud y sometido a un proceso de cuantizacion ternaria propia. La version aqui descrita es un re-host realizado por el usuario leok7v que consolida en un unico archivo los pesos del modelo de texto y el proyector de vision, ambos sin modificar respecto al repositorio original. Emplea una arquitectura hibrida Qwen3.5 que combina atencion completa con bloques de atencion lineal Gated DeltaNet, en una proporcion de tres bloques lineales por cada bloque de atencion completa.

Con 64 bloques y una dimension oculta de 5120, el modelo pesa aproximadamente 8,3 GB en su empaquetado Q2_0 ternario, lo que lo hace viable en dispositivos con memoria unificada moderada, como un Mac con 24 GB. La relevancia actual del modelo reside en su propuesta de inferencia on-device con capacidades multimodales y un coste de almacenamiento reducido gracias a la representacion ternaria de los pesos.

Es importante senalar que este repositorio no es la fuente autoritativa del modelo: se trata de una instantanea fijada que preserva los tensores originales y anade metadatos y el proyector de vision en el mismo archivo, con un formato `.ggxf` que solo carga en el runtime ChatOKF y no en llama.cpp estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 hibrida (`general.architecture = qwen35`): 64 bloques, atencion completa combinada con Gated DeltaNet lineal (3 bloques lineales por cada bloque de atencion completa) |
| Parametros totales | 27B (nominal, segun nombre del modelo); numero exacto no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (evaluado a contexto 512 en la medicion reportada) |
| Tipos de cuantizacion | Ternaria `Q2_0` (64 pesos en 18 bytes: FP16 scale + 2-bit codes, `w = (code - 1) * d`); proyector de vision en Q8_0; upstream ofrece tambien PQ2_0, PTQ1_0 y F16 |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.ggxf` (GGUF extendido con tensores del proyector y claves de metadatos adicionales); alineacion de tensores a 16 KB |

## Arquitectura y entrenamiento

El modelo es un transformer hibrido Qwen3.5 con 64 bloques, hidden size de 5120 y 24 cabezas de atencion de consulta frente a 4 de clave-valor. La innovacion estructural principal es la intercalacion de bloques de atencion lineal Gated DeltaNet con bloques de atencion completa en proporcion 3:1, lo que reduce el coste computacional y de memoria en contextos largos. Incorpora ademas una torre de vision cuantizada en Q8_0 que habilita la entrada de imagenes junto con texto.

Los pesos se almacenan en formato ternario {-1, 0, +1} mediante el esquema `Q2_0` de Prism ML, que empaqueta 64 pesos en 18 bytes. Los pesos incorporan una rotacion Hadamard plegada (claves `prism.hadamard.*`, bloque 1024, version 1, cabezas de valor agrupadas) que obliga al runtime a transformar las activaciones antes de cada capa lineal rotada y despues del token gather; un lector que ignore estas claves produce resultados incorrectos. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles.
- Procesamiento multimodal imagen-texto mediante la torre de vision integrada en el mismo archivo.
- Modo de razonamiento configurable (thinking on/off) con ajustes de muestreo diferenciados; el template por defecto usa esfuerzo de razonamiento `xhigh` y no admite `low`.
- Cuantizacion ternaria orientada a inferencia on-device con huella de memoria reducida.
- No se documenta soporte explicito de tool calling, function calling ni comportamiento agentico multi-paso.
- Capacidades multilingues limitadas al ingles segun los metadatos del repositorio.

## Casos de uso

- Asistente conversacional local en dispositivos de gama alta: con 8,3 GB de pesos, el modelo cabe en equipos con 24 GB de memoria unificada, como el M3 reportado, permitiendo chat privado sin conexion.
- Analisis de imagenes con descripcion textual: la torre de vision Q8_0 integrada permite enviar imagenes y obtener descripciones o respuestas en ingles en un unico archivo, simplificando el despliegue.
- Archivado y preservacion de modelos: al ser una instantanea fijada con sha256 verificados, sirve como referencia estable si el repositorio upstream se mueve o elimina.
- Prototipado de inferencia cuantizada ternaria: util para investigadores que quieran evaluar el impacto de la cuantizacion Q2_0 y la rotacion Hadamard en calidad y velocidad.
- Despliegue en entornos con memoria restringida: el empaquetado ternario reduce el peso del modelo frente a alternativas FP16, habilitando ejecucion en hardware consumer de gama alta.
- Pruebas de perplexidad y validacion de runtimes: la comparacion de perplexidad reportada (13,66 frente a 13,67) permite verificar la correccion de implementaciones de lectura del formato.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es de perplexidad y velocidad de inferencia:

| Metrica | Valor |
|---|---|
| Perplexidad (Simple Wikipedia, contexto 512, 24 chunks) | 13,66 (ChatOKF) frente a 13,67 (llama-perplexity upstream) |
| Prefill en M3 Mac 24 GB | ~55 tokens/s (contexto 512) |
| Decodificacion en M3 Mac 24 GB | ~7,7 tokens/s |

## Requisitos de hardware

- VRAM/memoria estimada: aproximadamente 8,3 GB para los pesos en Q2_0 con proyector Q8_0; se requiere margen adicional para el contexto KV.
- Verificado en Mac M3 con 24 GB de memoria unificada.
- Cabe en GPU consumer de gama alta con 12-16 GB o mas de VRAM, aunque no se han publicado pruebas en GPU dedicadas.
- Opciones de despliegue: exclusivamente runtimes que lean el proyector desde el mismo archivo, como ChatOKF; llama.cpp estandar no carga este archivo (falla con `wrong number of tensors`) y requiere el repositorio upstream de dos archivos con `--mmproj`.
- Latencia y throughput: prefill de ~55 tokens/s y decodificacion de ~7,7 tokens/s en M3 de 24 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ternary Bonsai 2 27B (este repo) | 27B | no disponible | Ternaria Q2_0 + vision Q8_0 | Apache 2.0 | GGUF extendido, solo ChatOKF |
| Ternary Bonsai 2 27B (upstream Prism ML) | 27B | no disponible | Q2_0, PQ2_0, PTQ1_0, F16 | Apache 2.0 | Dos archivos, compatible con llama.cpp |
| Qwen3.8-27B (modelo base) | 27B | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas variantes mas alla de la perplexidad citada.

## Limitaciones y advertencias

- Solo soporta ingles, lo que limita su uso en entornos hispanohablantes sin adaptacion.
- Riesgo de alucinacion inherente a los modelos generativos; no se han publicado evaluaciones de fidelidad.
- La cuantizacion ternaria agresiva puede degradar la calidad frente al modelo base en tareas complejas; no se aportan comparativas de calidad detalladas.
- El formato `.ggxf` no es compatible con llama.cpp estandar ni con la mayoria de lectores GGUF; el modelo solo carga en ChatOKF.
- Ignorar las claves de rotacion Hadamard produce resultados incorrectos (garbage) en cualquier runtime que no las procese.
- El template por defecto usa esfuerzo de razonamiento `xhigh` y no admite `low`, lo que condiciona la configuracion de muestreo.
- Este repositorio no es la fuente autoritativa; para benchmarks, empaquetados alternativos y documentacion completa debe consultarse el repositorio original de Prism ML.
- No se documentan sesgos especificos ni evaluaciones de seguridad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/leok7v/Ternary-Bonsai-2-27B-gguf
- Modelo base upstream: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- No se han encontrado en la informacion disponible enlaces adicionales a papers, blogs, repositorios o demos.
