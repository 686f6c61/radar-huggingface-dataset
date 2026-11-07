# shreyansh12183/shreyansh12183

## Resumen

`shreyansh12183/shreyansh12183` es un repositorio alojado en Hugging Face cuyo contenido no es un modelo de pesos, sino una model card en formato de pagina estatica (SDK `static`) que actua como portafolio del autor, Shreyansh Singh, fundador de Vigyan AI y ExperimentLab (Varanasi, India). El repositorio no publica ficheros de pesos, tokenizador, configuracion ni pipeline de inferencia; la informacion disponible lo describe como una vitrina de los 47 modelos abiertos que el autor afirma haber publicado en su cuenta.

El contenido de la model card describe el ecosistema tecnico del autor: modelos especializados de dominio (derecho estatutario indio, RTL y EDA de semiconductores, matematicas puras, fisica relativista, quimica molecular), arquitecturas MoE dispersas de 4 expertos, tecnicas de upcycling MoE, Depth Up-Scaling, Tool-DPO y GRPO, y una aplicacion de escritorio offline denominada Vigyan Pro v4.0.0 construida con WebKitGTK y Svelte 5. Tambien menciona 12 demos en Colab sobre GPU Tesla T4 con cuantizacion de 4 bits y tres datasets STEM y juridicos con mas de mil millones de tokens.

La relevancia de esta ficha es limitada desde el punto de vista de evaluacion de modelos: no hay artefactos descargables ni resultados de benchmarks verificables en la informacion proporcionada. Se documenta aqui como referencia del catalogo declarado por el autor, no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio es una pagina estatica, no un modelo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible para este repositorio; la model card menciona cuantizacion de 4 bits en las demos de Colab de otros modelos del autor |
| Idiomas soportados | no disponible |
| Licencia | no disponible en los metadatos del repositorio; la model card muestra una insignia con PolyForm Noncommercial 1.0.0 para el ecosistema del autor |
| Formato de pesos | no disponible (no se publican pesos en este repositorio) |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo entrenado. El SDK declarado es `static`, lo que indica que Hugging Face sirve el contenido como pagina web estatica (tipicamente un `index.html` o similar) y no como artefacto de aprendizaje automatico. No hay informacion sobre arquitectura de red, composicion del dataset, numero de tokens de entrenamiento ni etapas de alineacion (RLHF, DPO) asociadas a este identificador concreto.

La model card si describe, a nivel de ecosistema, innovaciones tecnicas atribuidas a otros modelos del autor: clusters MoE dispersos de 4 expertos con enrutamiento Top-1/Top-2 que operan en 1,2-2,4 GB de RAM, un motor CAS SymPy determinista en proceso para eliminar alucinaciones aritmeticas, y un CLI de gestion de pesos GGUF (`vigyan model status`, `vigyan model list`, `vigyan model pull`). Estos datos corresponden a la aplicacion Vigyan Pro y a los modelos enlazados, no al repositorio objeto de esta ficha.

## Capacidades

- El repositorio en si no expone capacidades de inferencia: no hay pipeline declarado, ni ficheros de pesos, ni API de inferencia.
- La model card enumera capacidades de los modelos del autor, no de este repositorio: generacion de texto especializada en derecho indio (BNS/BNSS 2023), Verilog HDL sintetizable, matematicas formales, quimica molecular y mecanica celeste.
- Soporte de tool calling: no disponible para este repositorio; la model card menciona Tool-DPO como tecnica aplicada en otros modelos del autor.
- Soporte de agentes y razonamiento multi-paso: no disponible para este repositorio; se menciona GRPO para razonamiento en tiempo de test en los trabajos del autor.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Consulta del catalogo de modelos del autor: el repositorio sirve como punto de entrada para localizar los 47 modelos y adaptadores publicados bajo la cuenta `shreyansh12183`, con enlaces a demos de Colab y a los repositorios individuales.
- Evaluacion de proveedor tecnologico: un equipo que valore soluciones SLM offline para dominios STEM o legal puede usar esta pagina para identificar candidatos concretos (por ejemplo, `vidhi-ai-1.5b-sovereign-masterpiece` o `vigyan-olmoe-1b-7b-dPO-masterpiece`) antes de descargar pesos.
- Referencia para despliegues air-gapped: la descripcion de Vigyan Pro v4.0.0 documenta un patron de ejecucion 100% local sin telemetria ni claves de API, util como caso de estudio para arquitecturas de escritorio con modelos GGUF.
- Documentacion de tecnicas de compresion: las referencias a MoE upcycling, Depth Up-Scaling y cuantizacion de 4 bits en T4 sirven como material de partida para experimentos de eficiencia en hardware de consumo.
- Localizacion de datasets: la pagina enlaza a tres datasets curados de STEM y derecho estatutario con mas de mil millones de tokens, utiles para fine-tuning de dominio.
- Formacion y divulgacion: los cuadernos de Colab enlazados permiten reproducir demos interactivas sin coste de infraestructura, adecuados para talleres o cursos introductorios a SLM especializados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: no aplica a este repositorio, que no contiene pesos.
- GPU recomendadas: no disponible para este repositorio. La model card indica que las demos de los modelos del autor se ejecutan en GPU Tesla T4 de Google Colab con cuantizacion de 4 bits.
- Compatibilidad con GPU de consumo: no disponible para este repositorio. La model card afirma que Vigyan Pro opera en menos de 4 GB de RAM y que el modelo `Vigyan-1.5B-4x-MoE` funciona por debajo de 1 GB de RAM.
- Opciones de despliegue: no disponible para este repositorio. El ecosistema del autor menciona GGUF y un CLI propio de gestion de pesos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No procede una comparativa de rendimiento porque el repositorio no contiene un modelo evaluable. A modo de contexto del catalogo declarado por el autor:

| Modelo citado en la model card | Dominio | Huella declarada | Parametros | Contexto | Licencia |
|---|---|---|---|---|---|
| Vidhi AI 1.5B Masterpiece | Derecho indio (BNS/BNSS 2023) | 1,06 GB | 1,5B (aproximado por nombre) | no disponible | no disponible |
| Vigyan 7B Quad-Master | Fusion SLERP de 4 especialistas | 4,26 GB | 7B (aproximado por nombre) | no disponible | no disponible |
| Vigyan OLMoE 1B-7B DPO | STEM, MoE dispersa | 4,02 GB | 1,3B activos por token | no disponible | no disponible |
| Vigyan 1.5B 4x-MoE | MoE de 4 expertos | 0,98 GB | 1,5B (aproximado por nombre) | no disponible | no disponible |

Los datos de esta tabla proceden exclusivamente de la model card y no han sido verificados de forma independiente.

## Limitaciones y advertencias

- El repositorio no contiene pesos, tokenizador ni configuracion: no es utilizable para inferencia ni para fine-tuning.
- No se declara licencia en los metadatos del repositorio; la insignia PolyForm Noncommercial 1.0.0 de la model card, si aplicase, restringiria el uso comercial.
- Las cifras de descargas (5.400+), numero de modelos (47) y volumen de datos (mas de mil millones de tokens) son afirmaciones del autor sin verificacion independiente en la informacion disponible.
- No hay resultados de benchmarks publicados que permitan validar las capacidades declaradas de los modelos enlazados.
- La model card mezcla informacion de producto (Vigyan Pro), de catalogo de modelos y de datasets; no debe interpretarse como documentacion tecnica de un modelo concreto.
- Riesgo de confusion: el identificador del repositorio coincide con el nombre de usuario, lo que puede llevar a citarlo erroneamente como modelo en lugar de como pagina de perfil.
- Sesgos conocidos: no disponible.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/shreyansh12183/shreyansh12183
- Perfil del autor en Hugging Face: https://huggingface.co/shreyansh12183
- Datasets del autor: https://huggingface.co/shreyansh12183/datasets
- Sitio web de ExperimentLab: https://experimentlab.in
- GitHub del autor: https://github.com/shreyansh001boy-tech
- Kaggle del autor: https://www.kaggle.com/shreyansh00singh
- Contacto: mailto:support@experimentlab.in
