# martincousseau/mermaid-persona-queries

## Resumen

Mermaid Persona Queries (v1) no es un modelo de lenguaje, sino un conjunto de datos de evaluación publicado por el usuario martincousseau en HuggingFace. Contiene 50 consultas de usuario escritas a mano para evaluar y comparar la generación de diagramas en sintaxis Mermaid a partir de texto (text-to-diagram), distribuidas entre 5 personas de usuario distintas que trabajan en una misma empresa ficticia (ingeniería, RR. HH., finanzas, operaciones, soporte, producto, legal, IT).

El problema que aborda es la falta de robustez en la evaluación: los usuarios reales de herramientas text-to-diagram no escriben prompts uniformes. Algunos pegan notas de reunión truncadas, otros dictan especificaciones Mermaid exactas, otros describen grafos formalmente y otros piensan en voz alta con autocorrecciones a mitad de frase. Un modelo evaluado solo con prompts limpios sobreestima su robustez, y este conjunto proporciona un pequeño conjunto de estrés controlado para evaluación condicionada por persona.

El dataset es solo de entrada (input-only): no incluye salidas Mermaid de referencia, por lo que está pensado para evaluación generativa mediante LLM-as-judge, puntuación por rúbricas o comparación por pares, y no para ajuste supervisado. Está licenciado bajo CC-BY-4.0, solo en inglés, y su tamaño (50 elementos) lo sitúa en la categoría n<1K, adecuada para evaluación cualitativa y suites de regresión, no para afirmaciones estadísticamente significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no aplica (es un conjunto de datos, no un modelo) |
| Parametros totales | no aplica |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | en (solo inglés) |
| Licencia | cc-by-4.0 |
| Formato de pesos | no aplica; datos en JSONL (data/train.jsonl, data/personas.jsonl) |
| Tipo de recurso | dataset de evaluación, solo entradas (input-only) |
| Tamano | 50 consultas (config `queries`) + 5 personas (config `personas`) |
| Categoria de tamano | n<1K |
| Tareas declaradas | text-generation |
| Configuraciones | `queries` (por defecto), `personas` |
| Campos de `queries` | id, query, persona_id, persona_name, persona_style |
| Campos de `personas` | persona_id, persona_name, persona_style, description |
| Salidas de referencia | no incluidas |
| Descargas / likes en HuggingFace | 0 / 0 |
| Fecha de creacion | 2026-09-19 |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento asociado: el recurso es un conjunto de datos curado manualmente. Las 50 consultas fueron redactadas a mano para esta versión v1 y se organizan en cinco personas con estilos de comunicación diferenciados, cada una cubriendo 10 consultas (Q01–Q10 = P1, Q11–Q20 = P2, Q21–Q30 = P3, Q31–Q40 = P4, Q41–Q50 = P5). Las personas son: P1 Maya (`thinking_out_loud`), redacción desordenada de flujo de conciencia con muletillas, autocorrecciones ("wait, no") y ramas retractadas; P2 David (`precise_architect`), conocedor de Mermaid que nombra el tipo de diagrama y da nodos, aristas y etiquetas exactos; P3 Priya (`mathematician`), notación formal con conjuntos, relaciones, funciones de transición, matrices de probabilidad y cardinalidades; P4 Sam (`everyday_user`), peticiones llanas y completas de una o dos frases sin conocimiento de Mermaid; y P5 Leo (`copy_paster_noisy`), pegados de material bruto (notas de reunión, logs, correos, exportaciones CSV) a menudo truncados a mitad de palabra.

La cobertura declarada abarca tipos de diagrama flowchart, diagramas de secuencia, diagramas de estado (v1/v2), diagramas ER, Gantt, organigramas, mapas mentales, diagramas de clases, git graph, timeline y grafos bipartitos/dirigidos. Las condiciones de entrada incluyen prompts limpios, prompts autocorregidos, especificaciones formales, pegados truncados (con cortes a mitad de palabra preservados), líneas de log embebidas, exportaciones CSV, ruido de hilos de correo y formato wiki roto. No hay innovación técnica asociada a decodificación especulativa, atención lineal ni técnicas similares, ya que el artefacto es un conjunto de evaluación. Todos los nombres, sistemas y escenarios son ficticios y no contienen datos personales ni datos reales de empresa.

## Capacidades

- Evaluación condicionada por persona: permite medir cómo varía la calidad de la generación de Mermaid según el estilo de comunicación del usuario, no solo según el contenido de la petición.
- Cobertura de tipos de diagrama: las consultas ejercitan flowchart, secuencia, estado (v1/v2), ER, Gantt, organigrama, mapa mental, clases, git graph, timeline y grafos bipartitos/dirigidos.
- Prueba de robustez ante entradas ruidosas: truncados a mitad de palabra, fragmentos de logs, CSV, correos y formato wiki roto.
- Prueba de fidelidad a especificaciones formales: consultas con notación matemática (conjuntos, relaciones, funciones de transición, cardinalidades) que exigen traducción fiel.
- Prueba de cumplimiento literal: la persona P2 exige conformidad exacta con nodos, aristas y etiquetas indicados, sin elementos inventados.
- Evaluación generativa: el diseño input-only encaja con LLM-as-judge, puntuación por rúbricas y comparación por pares.
- Suite de regresión y filtrado cualitativo por persona mediante la API de `datasets`.
- Soporte de tool calling / function calling: no disponible (no aplica a un dataset).
- Soporte de agentes y razonamiento multi-paso: no disponible (no aplica).
- Capacidades multilingües: no; el conjunto es solo en inglés.
- Capacidades especiales (modo thinking, visión, audio): no disponible (no aplica).

## Casos de uso

- Suite de regresión en CI para pipelines text-to-Mermaid: las 50 consultas pueden ejecutarse automáticamente en cada nueva versión del generador de diagramas y comparar la salida contra la versión anterior mediante puntuación por rúbricas, detectando regresiones en tipos de diagrama concretos.
- Evaluación de robustez persona-condicionada: un equipo puede comprobar si su modelo mantiene la calidad con la persona P5 (pegados truncados y ruidosos) frente a la persona P4 (peticiones limpias), y cuantificar la brecha entre ambos escenarios.
- Comparación por pares de modelos text-to-diagram: servir las mismas 50 consultas a varios modelos Mermaid-capaces y usar comparación pairwise para decidir cuál se integra en un producto de diagramación.
- Calibración de LLM-as-judge y diseño de rúbricas: el conjunto permite validar que un juez automático detecta fallos de fidelidad a la especificación (por ejemplo, nodos inventados por P2) y de interpretación de intención enterrada al final del mensaje (P1).
- Pruebas de tolerancia a entradas sucias en producción: simular el tráfico real de una herramienta de diagramas donde los usuarios pegan notas de reunión, correos o CSV truncados, para decidir si hace falta una fase de saneamiento previa.
- Investigación sobre variación de prompt por estilo de usuario: estudiar cómo distintas formulaciones de la misma necesidad afectan a la estructura del diagrama generado, con etiquetas de estilo legibles por máquina (`persona_style`).
- Selección y filtrado cualitativo en experimentos internos: usar la API de `datasets` para filtrar por persona, por ejemplo extrayendo solo las consultas de P5 y ejecutarlas como conjunto de estrés específico.
- Material docente y de demostración en cursos de evaluación de LLM: ilustrar la diferencia entre evaluar con prompts limpios y evaluar con entradas realistas de oficina.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El conjunto no incluye salidas Mermaid de referencia ni puntuaciones de modelos, por lo que no es posible presentar una tabla comparativa de MMLU, HumanEval, GSM8K ni métricas equivalentes.

## Requisitos de hardware

- El recurso en sí no requiere GPU: son 50 filas de consultas y 5 filas de personas en JSONL, con un peso despreciable y carga inmediata en memoria.
- Requisitos para la carga y el filtrado: cualquier máquina con Python y la librería `datasets` de HuggingFace; no se necesita aceleración por hardware.
- VRAM para inferencia del modelo evaluado: no disponible en la información proporcionada y depende por completo del modelo text-to-diagram que se elija como objeto de evaluación.
- GPU recomendadas, encaje en GPU de consumo, opciones de despliegue (vLLM, llama.cpp, Ollama, TGI) y latencia/throughput: no aplica al dataset; no disponible para los modelos evaluados, ya que la información proporcionada no especifica ninguno.

## Comparativa con modelos similares

No disponible. No se han proporcionado en la información conjuntos de datos comparables de evaluación text-to-diagram ni de robustez condicionada por persona, por lo que no es posible construir una tabla con parámetros, contexto, rendimiento, licencia y disponibilidad de alternativas sin inventar datos. Como referencia estructural, este recurso se distingue por tres rasgos declarados por el autor: evaluación condicionada por persona, entradas ruidosas con truncados deliberados y ausencia de salidas de referencia.

## Limitaciones y advertencias

- Tamaño reducido: 50 elementos, adecuados para evaluación cualitativa y suites de regresión, pero no para afirmaciones de líderes estadísticamente significativas.
- Solo inglés: las personas reflejan estilos de comunicación de oficina en inglés, por lo que no sirve para evaluar comportamiento multilingüe.
- Etiquetas de persona asignadas por el autor, no derivadas de estudios con usuarios reales; la correspondencia con estilos de usuario reales es una hipótesis de diseño.
- Conjunto solo de entrada: no incluye salidas Mermaid de referencia, lo que impide calcular métricas automáticas deterministas (por ejemplo, similitud estructural exacta) sin generar primero una referencia o recurrir a un juez.
- Los truncados y el ruido de las consultas de P5 son deliberados y no deben corregirse; "arreglarlos" invalida el propósito del conjunto.
- Riesgo de sobreajuste si se usa como conjunto de evaluación repetido sin control: con solo 10 consultas por persona, una mejora puede reflejar memorización del conjunto y no capacidad real.
- Contenido ficticio: no hay datos personales ni datos reales de empresa; los escenarios no deben interpretarse como representativos de un sector concreto.
- Licencia CC-BY-4.0: permite uso comercial con atribución; conviene citar el recurso según el BibTeX proporcionado por el autor.
- La información de la búsqueda web no aporta datos relevantes sobre este conjunto de datos; los resultados obtenidos corresponden a páginas de soporte de Microsoft sin relación con el recurso.

## Enlaces

- Conjunto de datos en HuggingFace: https://huggingface.co/datasets/martincousseau/mermaid-persona-queries
- Definiciones completas de las personas: [`personas.md`](personas.md) (referenciado en la model card del repositorio)
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
- Cita BibTeX (proporcionada por el autor):

```bibtex
@misc{mermaid-persona-queries,
  title  = {Mermaid Persona Queries: 50 persona-conditioned prompts for text-to-diagram evaluation},
  year   = {2026},
  note   = {v1},
  howpublished = {\url{https://huggingface.co/datasets/martincousseau/mermaid-persona-queries}}
}
```

- Papers, blogs, repositorios y demos adicionales: no disponibles. La búsqueda web realizada no devolvió enlaces relevantes sobre este recurso.
