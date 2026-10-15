# OsaurusAI/Diplodocus-preview-JANG_6M

## Resumen

Diplodocus-preview-JANG_6M es una compilacion cuantizada del asistente Diplodocus, desarrollado por OsaurusAI, orientada a tareas de finanzas, documentos, hojas de calculo y trabajo asistido por herramientas sobre macOS. El modelo se construye a partir del modelo base IFM/K2-Horizon-7B y se ha afinado sobre las herramientas propias del espacio de trabajo de Osaurus (libros de trabajo y documentos editados en sitio, y la herramienta interna `calculate`, con razonamiento activado o desactivado). Esta publicacion corresponde a la version "preview 4" del asistente y se distribuye como un paquete JANG de precision mixta afin (mixed-precision), con 6,94 GB de pesos empaquetados (6,46 GiB, aproximadamente 6,96 GB de descarga).

El problema que resuelve es el de un agente local y privado capaz de ejecutar flujos de trabajo ofimaticos y financieros sin salir del equipo: edicion in-place de hojas de calculo con formulas vivas, lectura de ventanas acotadas de ficheros, gestion de formularios PDF y firmas, y aritmetica monetaria exacta delegada a la herramienta `calculate` en lugar de resolverse de memoria. Frente a la preview 3, la preview 4 incorpora las rondas de entrenamiento R8-R11 y mejora las tareas de extremo a extremo sobre libros de trabajo y documentos, que pasan de 59/51 (razonamiento activado/desactivado, de 100) a 70/70, y las respuestas monetarias sobre documentos largos ejecutadas con calculadora, que pasan de 31 a 43 de 60 con razonamiento activado.

El modelo declara 8.999.178.240 parametros (~9B) y licencia Apache 2.0, con soporte unicamente de ingles. Su relevancia actual reside en que es un ejemplo de cuantizacion selectiva por modulo orientada a ejecucion en Apple Silicon mediante MLX, con un formato de pesos que requiere un runtime consciente de JANG (Osaurus 0.25.21 o superior, o vmlx-swift), y no un cargador MLX uniforme estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en detalle (modelo base: IFM/K2-Horizon-7B) |
| Parametros totales | 8.999.178.240 (~9B) |
| Parametros activos | no aplica (no se indica que el modelo sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | JANG affine mixed-precision: 8 bits (proyecciones de atencion, todas las 36 capas; grupo 128), 8 bits (down projection de la capa 1; grupo 64), 6/5/4 bits en modulos MLP (107 modulos: 36 a 6 bits, 65 a 5 bits, 6 a 4 bits; grupo 128), 6 bits (embeddings y cabeza de salida desanclada; grupo 128), BF16 (norms). Calibracion con estadisticas de importancia, AWQ y GPTQ sobre 3.295.622 tokens |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | MLX (affine packing con overrides de precision por modulo), safetensors |

Datos adicionales: el repo ocupa 21,3 GB; los pesos empaquetados suman 6.938.269.080 bytes; se verificaron los 254 layouts de modulos cuantizados contra las formas de sus tensores empaquetados.

## Arquitectura y entrenamiento

El autor no detalla la arquitectura interna del modelo base IFM/K2-Horizon-7B, por lo que la topologia (transformer denso, MoE, hibrida u otra) figura como no disponible. Lo que si se documenta es el proceso de cuantizacion: sobre el modelo base en BF16 se aplica una receta JANG de precision mixta afin, en la que cada modulo MLP se midio individualmente a 4, 5 y 6 bits (sustituyendo el modulo en el modelo BF16 y puntuandolo sobre texto de calibracion) y el presupuesto de bytes se asigno de forma voraz a los modulos con mejor ganancia de calidad por byte. La medicion mostro que el embedding de 250.000 filas y la cabeza de salida apenas costaban calidad a 6 bits, por lo que sus bytes se reasignaron al MLP; el paquete resultante es mas pequeno que un MLP integramente a 6 bits y a la vez mejor que la receta de la preview 3 al mismo tamano. Las proyecciones de atencion se mantienen a 8 bits en las 36 capas, y las normas en BF16.

La calibracion combina conversaciones de herramientas de Osaurus, cadenas del calculador, trazas generadas por la propia preview 4 en 60 familias de tareas (libros de trabajo, documentos PDF/Word/PowerPoint, finanzas con el motor de calculadora real, matematicas, codigo agentico, salida estructurada, traduccion, razonamiento activado y desactivado) renderizadas con el contrato compacto de espacio de trabajo de Osaurus, mas un 30% de texto generico (codigo, razonamiento, trabajo agentico, terminal, seguridad y recuperacion de contexto largo). No se menciona en la informacion disponible el uso de RLHF o DPO; el entrenamiento descrito para la preview 4 consiste en rondas supervisadas sobre las herramientas del espacio de trabajo (R8-R11). El modelo expone un formato de llamada a herramientas nativo `k2_horizon` y un modo de razonamiento con bloques vacios pre-rellenados para el modo desactivado.

## Capacidades

- Generacion de texto conversacional y razonamiento con dos niveles explicitos: razonamiento activado (High) y razonamiento desactivado (Low). El autor indica que no debe enviarse el nivel `medium`.
- Uso de herramientas (tool calling / function calling) mediante el sobre nativo `k2_horizon`, que Osaurus parsea; admite tolerancia a un aperturador duplicado `<ifm|tool_calls>`.
- Trabajo agentico multi-turno con historial de asistente y de herramientas preservado entre turnos.
- Edicion in-place de libros de trabajo y documentos mediante operaciones `file_edit`, ventanas acotadas de `file_read`, el modo `structure` y `set_cells` con formulas vivas, sin regenerar libros existentes.
- Gestion de formularios PDF y de PDF firmados.
- Aritmetica monetaria exacta delegando en la herramienta `calculate`, incluyendo cadenas de operaciones encadenadas, redondeo segun la regla del documento y propagacion de cifras redondeadas a la siguiente llamada.
- Operaciones nativas de fichero: `file_read`, `file_write`, `file_search` (por ejemplo, sobre PDF) y `calculate`.
- Soporte de salida estructurada entre las familias de tareas de calibracion.
- Capacidad de traduccion y de recuperacion de contexto largo, segun las familias de tareas de calibracion declaradas.
- Capacidades multilingues limitadas: el modelo declara unicamente el idioma ingles.

## Casos de uso

- Edicion de hojas de calculo con formulas vivas: el modelo puede modificar celdas concretas con `set_cells` y conservar las formulas del libro en lugar de regenerarlo, lo que lo hace adecuado para mantener libros de trabajo existentes sin romper su estructura.
- Automatizacion financiera con aritmetica exacta: para facturas, impuestos y totales, el modelo conduce la herramienta `calculate` en lugar de calcular de memoria, de modo que se evitan los errores de arrastre de digito; se ha validado un flujo de factura respaldado por calculadora con seis turnos de modelo y cinco llamadas a `calculate`, con resultado correcto de 283,71 dolares.
- Procesamiento de formularios PDF y documentos firmados: el modelo puede leer formularios PDF y abordar cambios sobre documentos firmados, aunque su fiabilidad en este ultimo caso es limitada (3 de 10 con razonamiento activado).
- Asistente ofimatico sobre documentos Word, PowerPoint y PDF: con las familias de tareas de calibracion cubriendo estos formatos, el modelo puede leer y editar contenido de documentos dentro del contrato de espacio de trabajo compacto de Osaurus.
- Agente de escritorio privado en macOS: al ejecutarse localmente sobre Apple Silicon y no requerir nube, encaja en escenarios donde la confidencialidad de documentos y hojas de calculo es un requisito, gestionando lectura y escritura de ficheros mediante las herramientas nativas.
- Automatizacion de tareas de fichero multipaso: el soporte de `file_read`, `file_write`, `file_edit` y `file_search` permite construir bucles de agente que inspeccionan, modifican y verifican ficheros de forma encadenada.
- Extraccion de respuestas monetarias sobre documentos largos: con razonamiento activado, el modelo resuelve 43 de 60 respuestas monetarias de extremo a extremo ejecutadas con calculadora, lo que lo hace util para resumen y calculo sobre documentos extensos.
- Recuperacion de contexto largo: la calibracion incluye pruebas de recuperacion de contexto largo, de modo que el modelo puede emplearse en tareas que requieren localizar informacion dentro de documentos extensos, sujeto a la longitud de contexto real no especificada.

## Benchmarks y rendimiento

El autor no publica benchmarks de exactitud de tarea estandar (MMLU, HumanEval, GSM8K, etc.). Los datos disponibles son diagnosticos de cuantizacion sobre datos de la distribucion de entrenamiento, no benchmarks de tarea independientes, y se presentan con esa advertencia.

| Metrica | Este paquete (JANG 6M, preview 4) | Receta preview 3 | BF16 con ruido de embedding de un ULP (suelo de medida) |
|---|---|---|---|
| KL restringido top-128 (mediana) | 0,0050 | 0,0172 | 0,0013 |
| KL restringido top-128 (media) | 0,063 | 0,170 | 0,020 |
| Acuerdo top-1 | 92,6% | 87,0% | 96,2% |

Evaluaciones adicionales aportadas por el autor:

| Evaluacion | Resultado |
|---|---|
| Duplicaciones llamada-vs-respuesta | 1 de 430 decisiones |
| Acuerdo de cierre de bloque de razonamiento | 424 de 429 |
| Integridad de etiquetas con razonamiento desactivado | 35 de 35 |
| Puntos evaluados en total | 646.927 posiciones |
| Tareas de extremo a extremo sobre libro/documento (preview 3 -> preview 4) | 59/51 -> 70/70 (de 100, on/off) |
| Respuestas monetarias sobre documento largo con calculadora (preview 3 -> preview 4) | 31 -> 43 de 60 |
| Pruebas en runtime real vmlx-swift | 14 de 14 finalizadas limpiamente |

## Requisitos de hardware

- Pesos cuantizados: 6,94 GB (6,46 GiB); descarga completa aproximada de 6,96 GB. El repo en HuggingFace ocupa 21,3 GB, por lo que conviene descargar el paquete completo.
- RAM/VRAM estimada para inferencia: alrededor de 7-8 GB solo para los pesos, mas el espacio de cache KV y activaciones, cuya magnitud depende de la longitud de contexto efectiva (no especificada). Se trata de una estimacion, no de una cifra publicada por el autor.
- Plataforma recomendada: Apple Silicon con memoria unificada, dado que la libreria declarada es MLX y los tags incluyen `apple-silicon`. Un Mac con 16 GB de memoria unificada o superior deberia poder alojar el modelo con margen para el contexto; con 8 GB el margen es muy ajustado.
- Compatibilidad de runtime: requiere Osaurus 0.25.21 o superior, o un runtime vmlx-swift compatible con JANG. El autor advierte que un cargador MLX uniform-bit estandar es insuficiente, por lo que no es desplegable directamente con llama.cpp, Ollama, vLLM o TGI en su formato actual.
- GPU recomendadas: no disponible. No se documentan despliegues en A100, H100 ni RTX 4090; el formato esta orientado a Apple Silicon.
- Cabe en GPU de consumo: no se indica soporte CUDA; el formato MLX/JANG esta pensado para Apple Silicon.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OsaurusAI/Diplodocus-preview-JANG_6M (este) | ~9B | no disponible | JANG affine mixta, 6,94 GB (8/6/5/4 bits) | apache-2.0 | HuggingFace, runtime Osaurus/vmlx-swift |
| OsaurusAI/Diplodocus-preview-7B-JANGH7 | no disponible | no disponible | JANG (7B) | no disponible | HuggingFace |
| OsaurusAI/Diplodocus-preview2-JANGH7 | ~7B (base K2-Horizon-7B) | no disponible | JANG, 7,2 GB | no disponible | HuggingFace |
| IFM/K2-Horizon-7B (modelo base) | ~7B nominal (el paquete reporta ~9B) | no disponible | BF16 | no disponible | HuggingFace |

Las alternativas mas cercanas son otras compilaciones del mismo asistente Diplodocus publicadas por OsaurusAI, que comparten modelo base y objetivo (finanzas, documentos y trabajo ofimatico). No se dispone de benchmarks comparativos publicados entre ellas mas alla de las comparaciones con la receta preview 3 incluidas en la propia model card.

## Limitaciones y advertencias

- Aritmetica mental sin ayuda: es una limitacion declarada del modelo. En una de dos pruebas de factura sin calculadora el resultado fue 283,70 dolares tras un desliz de digito en la linea de impuestos, similar al error de la preview 3 en BF16. Para dinero y aritmetica exacta debe usarse razonamiento activado y la herramienta `calculate`.
- Libros de trabajo nuevos: a veces las formulas vivas terminan como formulas de texto.
- PDF firmados: las solicitudes de cambio sobre PDF firmados con razonamiento activado se resuelven en 3 de 10 casos.
- Aritmetica monetaria con razonamiento desactivado: poco fiable; el autor recomienda activar el razonamiento.
- Identidad: el modelo puede identificarse como K2, segun las propias notas del autor.
- Idioma: soporta unicamente ingles, lo que limita su uso en castellano u otros idiomas sin trabajo adicional.
- Contexto: la longitud de contexto no esta documentada, lo que dificulta planificar despliegues con entradas largas.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; los diagnosticos aportados son de cuantizacion sobre datos de entrenamiento, no de exactitud factual.
- Dependencia de runtime: no funciona con cargadores MLX uniform-bit estandar; requiere Osaurus 0.25.21+ o vmlx-swift con soporte JANG. Debe usarse el tokenizer y la plantilla de chat incluidos.
- Nivel de razonamiento: no debe enviarse `medium`; solo `High` (activado) o `Low` (desactivado).
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base IFM/K2-Horizon-7B, cuya licencia no se detalla en la informacion disponible.
- Los diagnosticos de calidad aportados (KL, acuerdo top-1) corresponden a datos de la distribucion de entrenamiento y no constituyen una evaluacion independiente de exactitud de tarea.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OsaurusAI/Diplodocus-preview-JANG_6M
- Modelo base: https://huggingface.co/IFM/K2-Horizon-7B
- Otra compilacion de la familia: https://huggingface.co/OsaurusAI/Diplodocus-preview-7B-JANGH7
- Otra compilacion de la familia: https://huggingface.co/OsaurusAI/Diplodocus-preview2-JANGH7
- Organizacion en HuggingFace: https://huggingface.co/OsaurusAI
- Sitio oficial: https://osaurus.ai/
- Pagina de modelos: https://osaurus.ai/models
- Repositorio en GitHub: https://github.com/osaurus-ai/osaurus
