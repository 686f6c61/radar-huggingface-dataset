# Scinetics-ai/all-atom-structure-tokenizer

## Resumen

All-Atom Structure Tokenizer es una implementación de referencia en PyTorch del tokenizador descrito en el informe técnico *AtomLM-9b for Biomolecular Structure Prediction* de Scinetics. El modelo convierte un ensamblado de átomos pesados (proteínas, ADN, ARN, ligandos e iones) en un identificador entero por unidad química, y un decodificador de coordenadas reconstruye el ensamblado a partir de esos identificadores, el inventario químico y ruido gaussiano. No es un modelo generativo de texto ni un modelo de lenguaje: es un componente de tokenización estructural para pipelines de biología computacional.

La relevancia de esta publicación es doble. Por un lado, expone la arquitectura completa del tokenizador del sistema AtomLM-9b (codificador de grafos atómicos, pooling por unidad, capas de atención sobre el ensamblado completo, cuantización FSQ de 8192 identificadores y decodificador equivariante). Por otro, y de forma explícita, el repositorio no distribuye checkpoints entrenados ni reproduce los resultados de benchmark del informe: el entrenamiento parte de parámetros inicializados aleatoriamente, por lo que los identificadores producidos por distintos checkpoints no tienen por qué compartir significado estructural.

Se trata, por tanto, de una release de código fuente, un ejemplo y tests, orientada a investigadores que quieran reproducir, auditar o reentrenar el tokenizador, no a un modelo listo para producción. El ejemplo incluido (dos residuos de péptido y tres átomos pesados de ligando) produce cinco identificadores y doce coordenadas reconstruidas en ángströms.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizador estructural: codificador de grafo atómico (8 bloques escalar/vector, 256 canales escalares y 64 vectoriales) + codificador de unidades (attention pooling + 4 capas de atención a anchura 512) + FSQ + decodificador de coordenadas (12 capas transformer a anchura 768 y 4 bloques atómicos equivariantes a anchura escalar 256) |
| Parametros totales | no disponible (el repositorio no publica recuento; el perfil "report" es la configuración del informe, no un checkpoint) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el grafo atómico usa hasta 32 vecinos espaciales intramoleculares y 16 intermoleculares por receptor dentro de 12 Å; la atención de unidades tiene coste O(L²) en memoria para L unidades) |
| Tipos de cuantizacion | no disponible (no se publican pesos; el código es PyTorch de referencia) |
| Idiomas soportados | no aplica (modelo biológico, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | checkpoints PyTorch (.pt) generados por el propio entrenador; no se distribuyen pesos preentrenados |

## Arquitectura y entrenamiento

El tokenizador opera en cuatro etapas. Primero construye un grafo atómico con todos los enlaces covalentes más hasta 32 vecinos espaciales intramoleculares y 16 intermoleculares por receptor dentro de un radio de 12 Å. Un codificador de átomos de 8 bloques escalar/vector (256 canales escalares, 64 vectoriales) procesa ese grafo. Después, un codificador de unidades aplica attention pooling dentro de cada unidad química y 4 capas de atención sobre el ensamblado completo a anchura 512. Una lectura invariante (escalares, normas de vectores, productos internos y volúmenes con signo ordenados) proyecta de 512 a 5 dimensiones, que se cuantizan con FSQ de niveles (8, 8, 8, 4, 4) y entrenamiento straight-through, generando identificadores en base mixta de 0 a 8191 (el primer escalar tiene peso de radix 1; los siguientes, 8, 64, 512 y 2048).

El decodificador de coordenadas consta de 12 capas transformer a anchura 768 y 4 bloques atómicos equivariantes a anchura escalar 256. El muestreo parte de ruido gaussiano centrado, modela coordenadas conjuntas del ensamblado y usa 50 pasos de Heun por defecto. El entrenamiento emplea augmentación de rotaciones propias, acoplamiento Kabsch de rotación propia, flow matching enmascarado y términos auxiliares de enlace, ángulo, choque estérico, quiralidad, distancia y uso marginal. La decodificación de un identificador recupera primero los cinco niveles escalares discretos de forma exacta; la conversión de esos niveles a coordenadas atómicas es aprendida y estocástica. El repositorio no documenta el número de tokens ni la composición del dataset de entrenamiento del informe, y el entrenador incluido es un ciclo pequeño con AdamW que procesa un ensamblado por paso de optimización.

## Capacidades

- Tokenización estructural de ensamblados biomoleculares: convierte un ensamblado de átomos pesados en un identificador entero por unidad química (hasta 8192 identificadores distintos).
- Soporte de seis tipos de unidad: `protein`, `dna`, `rna`, `ligand`, `ion` y `modified`; residuos proteicos y nucleótidos forman una unidad cada uno, mientras que cada átomo pesado de ligando y cada ion forman su propia unidad.
- Decodificación de coordenadas: reconstruye coordenadas en ángströms a partir de identificadores, inventario químico y ruido gaussiano, con muestreo estocástico mediante 50 pasos de Heun.
- Manejo de datos incompletos: los átomos con `xyz` ausente o nulo se marcan como esperados sin coordenadas; una unidad totalmente no observada recibe el centinela `-1` en la codificación y requiere un identificador válido antes del muestreo.
- Verificación de integridad química: la CLI almacena una huella de los registros químicos junto a los identificadores y la verifica antes de decodificar; eliminar todos los campos `xyz` preserva esa huella.
- Invariencia geométrica: los tests cubren los 8192 identificadores FSQ, la geometría bajo rotaciones y traslaciones propias, y el signo de volúmenes locales.
- API de Python: `StructureTokenizer`, `load_assembly` y `tokenizer_loss` permiten codificar, decodificar y calcular la pérdida con retropropagación.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Investigación en representaciones discretas de estructura: el código permite estudiar cómo se comporta la cuantización FSQ de 8192 niveles sobre ensamblados reales y comparar variantes de la lectura invariante o del decodificador, algo útil para quien diseñe tokenizadores estructurales propios.
- Reentrenamiento sobre datos propios: con `--profile report` y registros de entrenamiento propios en GPU CUDA, un equipo puede entrenar el tokenizador sobre su conjunto de estructuras (por ejemplo, un subconjunto del PDB) y obtener checkpoints con identificadores coherentes dentro de su dominio.
- Preprocesamiento de pipelines de plegamiento: los identificadores por unidad pueden servir como representación intermedia compacta en un pipeline que alimente un modelo de predicción de estructura, siempre que se entrene el tokenizador de forma consistente con el resto del sistema.
- Compresión y reconstrucción de conformeros: dado un ensamblado con conformero resuelto, el codificador produce identificadores y el decodificador permite medir la fidelidad de reconstrucción geométrica, útil para evaluar la pérdida de información de la tokenización.
- Auditoría y reproducción de resultados: al liberar la arquitectura del informe AtomLM-9b, el repositorio permite a terceros verificar decisiones de diseño (niveles FSQ, términos de pérdida, pasos de Heun) antes de invertir en el sistema completo.
- Docencia y prototipado: el ejemplo `peptide_ligand.json` y los tests permiten ejecutar el ciclo completo de entrenamiento, codificación y decodificación en minutos con el perfil `tiny`, adecuado para formación o para validar instalaciones.
- Procesamiento de complejos proteína-ligando: el grafo admite enlaces covalentes intercadena y vecinos intermoleculares dentro de 12 Å, lo que permite tokenizar interfaces de unión siempre que el preprocesamiento (expansión de ensamblados biológicos PDB/mmCIF, percepción de enlaces de ligando y estandarización CCD) se realice aguas arriba.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio indica explícitamente que no reproduce las puntuaciones de benchmark del informe técnico de AtomLM-9b.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio no publica recuento de parámetros ni perfiles de memoria; el coste depende de la configuración elegida (`tiny` o `report`) y del tamaño del ensamblado.
- GPU recomendadas: el entrenamiento con `--profile report` requiere una máquina con PyTorch para CUDA y `--device cuda`; no se especifican modelos de GPU concretos.
- Cabe en GPU de consumo: no disponible. El perfil `tiny` con 2 pasos de entrenamiento está pensado para ejecutarse en CPU; el perfil `report` no documenta requisitos de memoria.
- Opciones de despliegue: el paquete se instala con `pip install -e ".[test]"` sobre Python 3.10 o superior y se usa mediante la CLI `python -m atomtoken` (subcomandos `train`, `encode`, `decode`) o la API de Python. No hay integración documentada con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. El grafo atómico tiene coste O(N²) en tiempo para N átomos y la atención de unidades O(L²) en memoria para L unidades; el repositorio recomienda recortar ensamblados cuando la memoria sea limitada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros tokenizadores estructurales comparables ni datos de rendimiento que permitan una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- No se distribuyen checkpoints entrenados: el entrenamiento parte de parámetros aleatorios y los identificadores de distintos checkpoints no tienen por qué compartir significado estructural.
- No reproduce los benchmarks del informe técnico AtomLM-9b; cualquier cifra de rendimiento del informe no es verificable con esta release.
- La licencia no está declarada, lo que impide determinar si el uso comercial está permitido; conviene contactar con el autor antes de integrarlo en producción.
- El decodificador es estocástico: la conversión de niveles discretos a coordenadas es aprendida y depende de ruido gaussiano, por lo que dos muestreos del mismo identificador pueden diferir.
- Requiere preprocesamiento aguas arriba no incluido: expansión de ensamblados biológicos PDB/mmCIF, percepción de enlaces de ligando y estandarización CCD.
- El orden de átomos y unidades debe preservarse entre codificación y decodificación; la CLI verifica la huella química, pero un reordenamiento fuera de ella rompe la correspondencia.
- Las unidades totalmente no observadas reciben el centinela `-1` y necesitan un identificador válido antes del muestreo; el inventario esperado de átomos debe conservarse al decodificar o entrenar con datos incompletos.
- Coste cuadrático en átomos y en unidades: los ensamblados grandes pueden agotar la memoria, y el repositorio solo sugiere recortarlos.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni agentes, y no tiene capacidades multilingües.
- Riesgo de sesgo y alucinación en el sentido lingüístico no aplica; en su lugar, el riesgo es una reconstrucción geométrica inexacta o identificadores sin significado consistente si el tokenizador no se entrena adecuadamente.
- El entrenador incluido es un ciclo pequeño con AdamW que procesa un ensamblado por paso; no está pensado para entrenamientos a gran escala sin trabajo adicional.

## Enlaces

- Hugging Face: https://huggingface.co/Scinetics-ai/all-atom-structure-tokenizer
- Informe técnico referenciado: *AtomLM-9b for Biomolecular Structure Prediction* (Scinetics), citado en la model card; no se proporciona URL directa en la información disponible.
